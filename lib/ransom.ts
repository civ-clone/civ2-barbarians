/** A barbarian leader's ransom at activity level `activity` (`unit_resolve_attack_ransom`, `a × 100 ÷ 2`). */
export const ransom = (activity: number): number =>
  Math.trunc((activity * 100) / 2);

export default ransom;
