/**
 * Fixed popup frame — ONE size for every tab. 290 x 400, measured from the
 * home screen (verdict card + 2x2 tiles fill it with no dead space and no
 * scroll). Kept as constants (not CSS vars): tailwind v4 tree-shakes unused
 * @theme vars out of the built CSS, which silently collapses the shell.
 */
export const FRAME = {
  width: 290,
  height: 400,
  headerHeight: 52,
  navHeight: 54,
  padX: 16,
} as const
