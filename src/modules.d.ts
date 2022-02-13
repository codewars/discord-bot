declare module "fuzzysearch" {
  /**
   * Return true only if each character in the needle can be found in the haystack and
   * occurs after the preceding character.
   * https://www.npmjs.com/package/fuzzysearch
   */
  function fuzzysearch(needle: string, haystack: string): boolean;
  export = fuzzysearch;
}
