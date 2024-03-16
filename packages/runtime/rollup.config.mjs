import cleanup from "rollup-plugin-cleanup";

import filesize from "rollup-plugin-filesize";

import typescript from "rollup-plugin-typescript2";

export default {
  input: "out-tsc/index.js",
  plugins: [cleanup(), typescript()],
  output: [
    {
      file: "dist/keksjs.js",
      format: "esm",
      plugins: [filesize()],
    },
  ],
};
