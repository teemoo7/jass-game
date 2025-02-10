export default class Utils {
  static getRandomElement(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Fisher-Yates shuffle
  static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
