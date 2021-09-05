export class A {
  #num = B;
  num2 = 2;
  log() {
    return this.#num;
  }
}

export const B = () => {
  const p1 = new Promise(() => {
    console.log("看这里");
  });
  Promise.allSettled([p1]).then(() => {
    console.log(123);
  });
};
