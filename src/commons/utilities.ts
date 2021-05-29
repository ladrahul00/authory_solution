export class MapWithDefault<K, V> extends Map<K, V> {
  public getOrDefault(key: K, defaultValue: V): V {
    let value = this.get(key);
    if (!value) {
      this.set(key, defaultValue);
      value = defaultValue;
    }
    return value;
  }
}
