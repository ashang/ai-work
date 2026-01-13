use clap::Parser;
use std::fs;
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

fn is_text_file(path: &PathBuf) -> bool {
    if let Some(ext) = path.extension() {
        let ext_str = ext.to_string_lossy().to_lowercase();
        matches!(
            ext_str.as_str(),
            "txt" | "md" | "rs" | "py" | "js" | "ts" | "json" | "xml" | "yaml" | "yml"
                | "toml" | "ini" | "cfg" | "conf" | "html" | "css" | "sh" | "bash" | "zsh"
                | "c" | "cpp" | "h" | "hpp" | "java" | "go" | "rb" | "php" | "swift"
                | "kt" | "scala" | "clj" | "hs" | "ml" | "fs" | "vb" | "cs" | "sql"
                | "r" | "m" | "pl" | "pm" | "lua" | "vim" | "el" | "ex" | "exs" | "erl"
                | "hrl" | "dockerfile" | "makefile" | "cmake" | "gradle" | "properties"
                | "log" | "csv" | "tsv" | "diff" | "patch"
        )
    } else {
        // Files without extensions might be text files (like README, Makefile, etc.)
        // Check if filename suggests it's a text file
        if let Some(name) = path.file_name() {
            let name_str = name.to_string_lossy().to_lowercase();
            name_str.starts_with("readme")
                || name_str.starts_with("makefile")
                || name_str.starts_with("dockerfile")
                || name_str == "license"
                || name_str == "changelog"
                || name_str == "authors"
                || name_str == "contributors"
        } else {
            false
        }
    }
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
            
            if path.is_file() && is_text_file(&path) {
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
