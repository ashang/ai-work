#!/usr/bin/env python3
import os
import re
import json
import argparse
from datetime import datetime
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from pathlib import Path
from typing import List, Dict, Optional, Union
import html5lib

class URLExtractor:
    def __init__(self):
        self.urls = set()  # Using set to avoid duplicates

    def extract_from_text(self, content: str) -> None:
        """Extract URLs from plain text using regex"""
        # This regex matches most HTTP/HTTPS URLs
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        urls = re.findall(url_pattern, content)
        self.urls.update(urls)

    def extract_from_html_bookmarks(self, file_path: str) -> None:
        """Extract URLs from HTML bookmarks (Chrome/Firefox format)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    content = f.read()
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")
                return

        try:
            soup = BeautifulSoup(content, 'html5lib')
            # Find all anchor tags
            for a_tag in soup.find_all('a', href=True):
                url = a_tag.get('href')
                if url and url.startswith(('http://', 'https://')):
                    self.urls.add(url)
        except Exception as e:
            print(f"Error parsing HTML in {file_path}: {str(e)}")
        
    def extract_from_json_bookmarks(self, file_path: str) -> None:
        """Extract URLs from JSON bookmarks"""
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                # Recursively find all URLs in the JSON structure
                self._find_urls_in_json(data)
            except json.JSONDecodeError:
                print(f"Warning: {file_path} is not a valid JSON file")

    def _find_urls_in_json(self, data: Union[dict, list, str]) -> None:
        """Recursively find URLs in JSON data"""
        if isinstance(data, dict):
            for key, value in data.items():
                if key in ['url', 'URL', 'href', 'link'] and isinstance(value, str) and value.startswith(('http://', 'https://')):
                    self.urls.add(value)
                self._find_urls_in_json(value)
        elif isinstance(data, list):
            for item in data:
                self._find_urls_in_json(item)
        elif isinstance(data, str) and data.startswith(('http://', 'https://')):
            self.urls.add(data)

    def process_file(self, file_path: str) -> None:
        """Process a single file based on its extension"""
        ext = Path(file_path).suffix.lower()
        
        try:
            if ext == '.json':
                self.extract_from_json_bookmarks(file_path)
            #elif ext == '.html' or ext == '.htm':
            elif ext in ['.html', '.htm']:
                self.extract_from_html_bookmarks(file_path)
            else:  # For .txt, .md, or any other text file
                ##with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    try:
                        with open(file_path, 'r', encoding='latin-1') as f:
                            content = f.read()
                    except Exception as e:
                        print(f"Error reading file {file_path}: {str(e)}")
                        return
                self.extract_from_text(content)
            print(f"Processed: {file_path} - Found {len(self.urls)} unique URLs so far")
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")

    def process_directory(self, dir_path: str) -> None:
        """Process all supported files in a directory"""
        supported_extensions = ('.txt', '.md', '.markdown', '.json', '.html', '.htm')
        for root, _, files in os.walk(dir_path):
            for file in files:
                if file.lower().endswith(supported_extensions):
                    self.process_file(os.path.join(root, file))

    def save_to_markdown(self, output_file: str) -> None:
        """Save the collected URLs to a markdown file, sorted by domain"""
        if not self.urls:
            print("No URLs found to save.")
            return

        # Sort URLs by domain
        def get_domain(url):
            try:
                domain = urlparse(url).netloc
                # Remove www. for better grouping
                return domain.replace('www.', '')
            except:
                return ''

        sorted_urls = sorted(self.urls, key=lambda x: (get_domain(x), x))
        
        # Group by domain
        urls_by_domain = {}
        for url in sorted_urls:
            domain = get_domain(url)
            if domain not in urls_by_domain:
                urls_by_domain[domain] = []
            urls_by_domain[domain].append(url)

        # Generate markdown content
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        markdown_content = f"# Extracted URLs\n\n"
        markdown_content += f"*Generated on: {timestamp}*\n"
        markdown_content += f"*Total unique URLs: {len(self.urls)}*\n\n"

        for domain, urls in urls_by_domain.items():
            markdown_content += f"## {domain}\n\n"
            for url in urls:
                markdown_content += f"- [{url}]({url})\n"
            markdown_content += "\n"

        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"\n✅ Successfully saved {len(self.urls)} unique URLs to {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Extract and organize URLs from files into a Markdown document.')
    parser.add_argument('input', nargs='+', help='Input file(s) or directory path(s)')
    parser.add_argument('-o', '--output', default='extracted_urls.md', 
                       help='Output markdown file (default: extracted_urls.md)')
    
    args = parser.parse_args()
    extractor = URLExtractor()

    for path in args.input:
        if os.path.isfile(path):
            extractor.process_file(path)
        elif os.path.isdir(path):
            extractor.process_directory(path)
        else:
            print(f"Warning: {path} does not exist or is not accessible")

    extractor.save_to_markdown(args.output)

if __name__ == '__main__':
    main()

# r'(?:https?://)?(?:www\.)?[^\s<>"]+\.[^\s<>"/]+[^\s<>"]*'
# (?:...) is a non-capturing group