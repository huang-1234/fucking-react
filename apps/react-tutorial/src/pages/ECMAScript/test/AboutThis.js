function greet() {
  return `你好，我是 ${this.NODE_ENV}`;
}

greet()

function func() {
  console.log(this);
}


function main() {
  const mainObja = {
    func: func,
  }
  mainObja.func();
}

main()