Source: https://github.com/zhu1090093659/dsh-skins
Revision: 82f42bd3bf91ea88475e59a2753f87041a960a56

The upstream root LICENSE says BSD-3-Clause, but its package.json at the same
revision says Apache-2.0. This inconsistent marking is not treated as a grant
of a dual-license choice. Both texts are shipped and both sets of notice
requirements are conservatively retained. `we-player-source.ts` additionally
has an explicit MIT file header; MIT terms are shipped as LICENSE.MIT.

Copyright (c) 2026, zhu1090093659. All rights reserved.
Historical upstream notice: Copyright (c) 2026, dsh-external contributors.
Original module names identify @linxin666/dsh-client-ui-skin-center.

The three vendored files match the pinned originals after line-ending
normalization. Generated desktop/helper bundles remove module imports/exports,
transpile TypeScript where required and concatenate/bundle the source. Hermes
bridge and lifecycle adapters are implemented outside these vendor files.
See LICENSING.md and THIRD-PARTY-NOTICES.md for scope and distribution notices.

The license at this exact revision is available at:
https://github.com/zhu1090093659/dsh-skins/blob/82f42bd3bf91ea88475e59a2753f87041a960a56/LICENSE
