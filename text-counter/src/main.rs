use clap::Parser;
use std::fs;
use std::io::Read;
use std::path::PathBuf;
use walkdir::WalkDir;

#[derive(Parser)]
#[command(name = "text-counter")]
#[command(about = "Count occurrences of a text pattern in files within directories")]
struct Args {
    /// The text pattern to search for
    pattern: String,

    /// One or more directories to search
    directories: Vec<PathBuf>,

    /// Make search case-insensitive
    #[arg(short = 'i', long = "case-insensitive")]
    case_insensitive: bool,
}

struct FileResult {
    path: PathBuf,
    count: usize,
}

/// Check if a file is a text file by examining its content, similar to grep/ripgrep
/// Reads the first 8KB of the file and checks for binary indicators
fn is_text_file(path: &PathBuf) -> bool {
    // Try to open and read the file
    let mut file = match fs::File::open(path) {
        Ok(f) => f,
        Err(_) => return false, // If we can't open it, skip it
    };

    // Read first 8KB (8192 bytes) to check if it's text
    // This is similar to what ripgrep does
    let mut buffer = vec![0u8; 8192];
    let bytes_read = match file.read(&mut buffer) {
        Ok(n) => n,
        Err(_) => return false,
    };

    if bytes_read == 0 {
        // Empty file is considered text
        return true;
    }

    // Trim buffer to actual bytes read
    buffer.truncate(bytes_read);

    // Check for NULL byte (\0) - this is a strong indicator of binary files
    // 
    // Why NULL bytes indicate binary files:
    // 1. Text files (UTF-8, ASCII, etc.) use NULL only as string terminator in memory,
    //    but actual text content should never contain NULL bytes
    // 2. Binary formats frequently use NULL bytes:
    //    - Executable files: padding, alignment, string tables
    //    - Image formats: pixel data, metadata structures
    //    - Compressed files: binary data structures
    //    - Database files: binary records, padding
    //    - Object files: symbol tables, relocation data
    // 3. This heuristic is used by grep, ripgrep, and many Unix tools
    //    because it's fast and has very few false positives
    //
    // Edge cases where text files might have NULL:
    // - Very rare: UTF-16/UTF-32 text files (but these are uncommon)
    // - Malformed text files (which we probably don't want to search anyway)
    if buffer.contains(&0) {
        return false;
    }

    // Count non-printable characters (excluding common whitespace)
    // Common text whitespace: space (0x20), tab (0x09), newline (0x0A), carriage return (0x0D)
    let non_printable_count = buffer.iter()
        .filter(|&&b| {
            b < 0x20 && b != 0x09 && b != 0x0A && b != 0x0D
        })
        .count();

    // If more than 5% of bytes are non-printable (excluding common whitespace),
    // consider it binary
    let threshold = (bytes_read as f64 * 0.05) as usize;
    non_printable_count <= threshold
}

fn count_pattern_in_file(path: &PathBuf, pattern: &str, case_insensitive: bool) -> Result<usize, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    
    let count = if case_insensitive {
        let pattern_lower = pattern.to_lowercase();
        let content_lower = content.to_lowercase();
        content_lower.matches(&pattern_lower).count()
    } else {
        content.matches(pattern).count()
    };
    
    Ok(count)
}

fn search_directories(
    directories: &[PathBuf],
    pattern: &str,
    case_insensitive: bool,
) -> Result<Vec<FileResult>, Box<dyn std::error::Error>> {
    let mut results = Vec::new();

    for directory in directories {
        if !directory.exists() {
            eprintln!("Warning: Directory does not exist: {}", directory.display());
            continue;
        }

        if !directory.is_dir() {
            eprintln!("Warning: Path is not a directory: {}", directory.display());
            continue;
        }

        for entry in WalkDir::new(directory).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path().to_path_buf();
            
            if path.is_file() {
                // First check if it's a text file by content
                if !is_text_file(&path) {
                    continue; // Skip binary files
                }

                match count_pattern_in_file(&path, pattern, case_insensitive) {
                    Ok(count) => {
                        if count > 0 {
                            results.push(FileResult { path, count });
                        }
                    }
                    Err(e) => {
                        eprintln!("Error reading file {}: {}", path.display(), e);
                    }
                }
            }
        }
    }

    Ok(results)
}

fn format_results(results: &[FileResult]) -> String {
    let mut output = String::new();
    
    for result in results {
        output.push_str(&format!("File: {}\n", result.path.display()));
        output.push_str(&format!("  Count: {}\n\n", result.count));
    }
    
    let total_files = results.len();
    let total_occurrences: usize = results.iter().map(|r| r.count).sum();
    
    output.push_str(&format!("Total files searched: {}\n", total_files));
    output.push_str(&format!("Total occurrences: {}\n", total_occurrences));
    
    output
}

fn main() {
    let args = Args::parse();

    if args.directories.is_empty() {
        eprintln!("Error: At least one directory must be specified");
        std::process::exit(1);
    }

    match search_directories(&args.directories, &args.pattern, args.case_insensitive) {
        Ok(results) => {
            if results.is_empty() {
                println!("No occurrences found.");
            } else {
                print!("{}", format_results(&results));
            }
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
