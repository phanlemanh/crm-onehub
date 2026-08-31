# _acceptance

Acceptance contracts, eval suites and evidence reports for this repo — the Gate 1
and Gate 2 record for each feature.

Run the `acceptance-gate:acceptance` skill to create or verify a contract.

Artifacts are per-feature, one subfolder per slug: `_acceptance/<slug>/`.

## Run an executor by hand

The `executors` commands in `config.yaml` start with `${CLAUDE_PLUGIN_ROOT}`. The
acceptance skill fills that variable in. A plain shell does not, so set it first:

```
export CLAUDE_PLUGIN_ROOT=$(node scripts/resolve-plugin.mjs \
  --plugin acceptance-gate --require scripts/product-map.mjs)
node ${CLAUDE_PLUGIN_ROOT}/scripts/product-map.mjs --root . --check
```

An empty variable makes node fail with `MODULE_NOT_FOUND`. That failure is loud
on purpose: a stale version pin must never pass as a green gate.

CI runs the copies in `scripts/` and `lib/` instead. Those copies need no
variable. Keep them in step with the installed plugin version.
