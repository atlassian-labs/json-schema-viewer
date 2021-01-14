// By passing the expression being evaluated into this function
// for the default case, we we can assert at compile time that the
// check is exhaustive, because if we missed a case, the type of the
// expression will be something other than `never`.
// https://stackoverflow.com/a/39419171

export function assertExhaustive(_: never): never {
  return _;
}