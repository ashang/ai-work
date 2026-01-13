// 临时测试文件 - 演示 linter 检测

// 这个文件不会被编译（不在 main.rs 中），但可以展示 linter 如何工作

fn test_unused_variable() {
    let x = 5;  // ⚠️ 未使用的变量
}

fn test_type_error() {
    let x: i32 = "hello";  // ❌ 类型错误
}

fn test_borrow_error() {
    let mut vec = vec![1, 2, 3];
    let first = &vec[0];
    vec.push(4);  // ❌ 借用检查错误
}

fn test_clippy_style() {
    let x = true;
    if x == true {  // ⚠️ Clippy: 应该写成 if x
        println!("true");
    }
}
