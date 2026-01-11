>请帮我做一个小应用，目标是根据输入，提取url并排序、汇总到一个markdown 输出。
>
>输入文件格式可以是json或html格式的bookmarks，或txt/markdown等文本文件。

这是来自一个实际需求，从好几个浏览器导出的好多书签备份，想汇总到一起。用了上面的输入。

这个结果是windsurf给出的，我介入的地方只有 uv 安装那三行，以及发现有一个输入不是utf-8令其修订。

没有提到的需求包括去重和按目录处理都做到了，代码详细审核还没发现问题，结果经检验是达到预期的。

以下内容和代码基本是自动输出的。

# URL Extractor

A command-line tool to extract, sort, and organize URLs from various file formats into a well-structured Markdown document.

## Features

- Extract URLs from multiple file formats:
  - HTML bookmarks (Chrome/Firefox export)
  - JSON bookmarks
  - Plain text files (.txt)
  - Markdown files (.md, .markdown)
- Remove duplicate URLs
- Sort URLs by domain
- Generate a clean, organized Markdown output
- Recursively process directories

## Installation

1. Clone this repository or download the files
2. Install the required dependencies:

```bash
uv init
uv pip install -r requirements.txt
source .venv/bin/activate
```

## Usage

### Basic Usage

```bash
python url_extractor.py input_file1.txt input_file2.html -o output.md
```

### Process Multiple Files

```bash
python url_extractor.py file1.txt file2.json file3.html -o all_urls.md
```

### Process a Directory

```bash
python url_extractor.py /path/to/directory -o output.md
```

### Process Multiple Files and Directories

```bash
python url_extractor.py file1.txt /path/to/directory file2.json -o output.md
```

## Output Format

The output is a Markdown file with:
- A header with generation timestamp
- Total number of unique URLs found
- URLs grouped by domain
- Clickable Markdown links

## Examples

### Input (example.txt)
```
Check out these websites:
https://www.example.com
https://www.python.org
https://www.example.com/page1
```

### Output (output.md)
```markdown
# Extracted URLs

*Generated on: 2023-01-01 12:34:56*
*Total unique URLs: 3*

## example.com

- [https://www.example.com](https://www.example.com)
- [https://www.example.com/page1](https://www.example.com/page1)

## python.org

- [https://www.python.org](https://www.python.org)
```

## Requirements

- Python 3.6+
- beautifulsoup4
- html5lib
- python-dateutil

## License

MIT
