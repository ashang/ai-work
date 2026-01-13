# Text Counter

A Rust CLI application that searches for a text pattern in text files across directories and reports occurrence counts per file.

## Features

- Recursively searches through directories
- Supports multiple directories
- Case-sensitive or case-insensitive search
- Counts occurrences per file
- Supports a wide variety of text file extensions

## Installation

```bash
cargo build --release
```

## Usage

```bash
text-counter <PATTERN> <DIRECTORY>... [OPTIONS]
```

### Arguments

- `PATTERN`: The text pattern to search for (required)
- `DIRECTORY`: One or more directories to search (required, can specify multiple)

### Options

- `-i`, `--case-insensitive`: Make the search case-insensitive (default: case-sensitive)

### Examples

```bash
# Search for "hello" in the current directory (case-sensitive)
./target/release/text-counter hello .

# Search for "error" in multiple directories (case-insensitive)
./target/release/text-counter -i error ./src ./tests

# Search for "TODO" in a specific directory
./target/release/text-counter TODO /path/to/project
```

## Output Format

The application outputs results in the following format:

```
File: path/to/file1.txt
  Count: 5

File: path/to/file2.md
  Count: 12

Total files searched: 2
Total occurrences: 17
```

## Supported File Types

The application recognizes common text file extensions including:
- Source code files: `.rs`, `.py`, `.js`, `.ts`, `.java`, `.go`, `.c`, `.cpp`, etc.
- Markup files: `.md`, `.html`, `.xml`, `.json`, `.yaml`, `.toml`, etc.
- Configuration files: `.ini`, `.cfg`, `.conf`, `.properties`, etc.
- Scripts: `.sh`, `.bash`, `.zsh`, etc.
- And many more text-based formats

Files without extensions that match common names (like `README`, `Makefile`, `Dockerfile`, `LICENSE`) are also recognized as text files.

## Error Handling

The application handles various error cases gracefully:
- Non-existent directories are skipped with a warning
- Files that cannot be read are skipped with an error message
- Invalid paths are reported but don't stop the search
