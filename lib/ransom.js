"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ransom = void 0;
/** A barbarian leader's ransom at activity level `activity` (`unit_resolve_attack_ransom`, `a × 100 ÷ 2`). */
const ransom = (activity) => Math.trunc((activity * 100) / 2);
exports.ransom = ransom;
exports.default = exports.ransom;
//# sourceMappingURL=ransom.js.map