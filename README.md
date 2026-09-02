# JP C# Tools

A small VSCode extension for C# editing. First command: **Smart Enter**.

## Smart Enter (`Shift+Enter`)

In a `.cs` file, `Shift+Enter`:

- On a line that opens a block (a method/constructor signature, a type declaration, a control-flow
  head like `if (...)`, or a bare keyword like `else`/`try`/`get`) — inserts an Allman-style
  `{ }` pair below and places the cursor inside it.
- On anything else — inserts a blank line below, same as VSCode's built-in
  `editor.action.insertLineAfter`.

`Enter` is untouched.

### Known limitations

- A constructor with no accessibility modifier (`Player(int hp)`) has a one-token head and reads as
  a call, so it falls through to the line-below behavior.
- Explicit interface implementations (`void IFoo.Bar()`) are detected only incidentally, because the
  head happens to split into two tokens — the dotted name isn't specially handled.
- Brace style is fixed to Allman; there is no setting for K&R.
- Trailing-comment stripping is not string-literal aware (a URL like `"http://x"` inside quotes gets
  partially stripped). This is intentional: every malformed result it can produce fails the
  block-opener rules and falls through to the correct fallback anyway.

## Development

Requires [pnpm](https://pnpm.io) (pinned via `packageManager` in `package.json`; `corepack enable`
picks it up automatically).

```
pnpm install
pnpm compile   # or: pnpm watch
pnpm lint
pnpm typecheck
pnpm test
```

Press `F5` to launch an Extension Development Host with the extension loaded.

### Packaging

```
pnpm package
```

Produces a `.vsix` via `vsce package --no-dependencies`. That flag is correct only because this
extension has zero runtime dependencies — if one is ever added, packaging must be reworked (either
drop the flag and switch off pnpm's symlinked `node_modules`, or bundle with esbuild first).

## License

MIT — see [LICENSE](LICENSE).
