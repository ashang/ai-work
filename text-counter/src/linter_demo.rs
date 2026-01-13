// 这个文件演示了各种 linter 会检测到的问题
// 注意：这个文件不应该被编译，仅用于演示

// 1. 语法错误示例
fn syntax_error() {
    let x = 5  // ❌ 缺少分号
}

// 2. 类型错误示例
fn type_error() {
    let x: i32 = "hello";  // ❌ 类型不匹配
}

// 3. 借用检查错误示例
fn borrow_checker_error() {
    let mut vec = vec![1, 2, 3];
    let first = &vec[0];
    vec.push(4);  // ❌ 不能同时有可变和不可变借用
    println!("{}", first);
}

// 4. Clippy 警告示例
fn clippy_warnings() {
    let x = true;
    if x == true {  // ⚠️ Clippy: 应该写成 if x
        println!("true");
    }
    
    let s = String::from("hello");
    let s2 = s.clone();  // ⚠️ Clippy: 可能不需要 clone
    
    let vec = vec![1, 2, 3];
    for i in 0..vec.len() {  // ⚠️ Clippy: 应该使用 for item in vec
        println!("{}", vec[i]);
    }
}

// 5. 未使用的变量警告
fn unused_variable() {
    let x = 5;  // ⚠️ 警告：变量未使用
}

// 6. 未使用的导入警告
use std::collections::HashMap;  // ⚠️ 如果未使用会警告

fn main() {
    // 这个文件仅用于演示，不应该被编译
}
