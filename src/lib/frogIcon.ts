/**
 * Shared raw SVG path data for critter icons rendered outside a normal React
 * tree (the Satori-rendered favicon in app/icon.tsx, and the hand-authored
 * SVG primitives in BonsaiTree.tsx). Where a normal React tree is available
 * (page.tsx, TaskListCard.tsx), render the equivalent react-icons component
 * directly instead of importing these constants.
 */

/**
 * The app's one frog mark. Chosen over a bolder/more detailed alternative
 * (Game Icons' "Frog") because this simple side-profile silhouette stays
 * legible at small sizes (confirmed by rendering candidates at true 16px) —
 * see page.tsx/TaskListCard.tsx, which render the equivalent `<FaFrog />`.
 *
 * Path data: Font Awesome 6 "Frog" (https://fontawesome.com/icons/frog),
 * CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ — via react-icons.
 */
export const FROG_ICON_VIEWBOX = "0 0 576 512";
export const FROG_ICON_PATH =
  "M368 32c41.7 0 75.9 31.8 79.7 72.5l85.6 26.3c25.4 7.8 42.8 31.3 42.8 57.9c0 21.8-11.7 41.9-30.7 52.7L400.8 323.5 493.3 416l50.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-8.5 0-16.6-3.4-22.6-9.4L346.9 360.2c11.7-36 3.2-77.1-25.4-105.7c-40.6-40.6-106.3-40.6-146.9-.1L101 324.4c-6.4 6.1-6.7 16.2-.6 22.6s16.2 6.6 22.6 .6l73.8-70.2 .1-.1 .1-.1c3.5-3.5 7.3-6.6 11.3-9.2c27.9-18.5 65.9-15.4 90.5 9.2c24.7 24.7 27.7 62.9 9 90.9c-2.6 3.8-5.6 7.5-9 10.9L261.8 416l90.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L64 480c-35.3 0-64-28.7-64-64C0 249.6 127 112.9 289.3 97.5C296.2 60.2 328.8 32 368 32zm0 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48z";

/**
 * The bonsai's occasional squirrel visitor. Font Awesome has no squirrel icon.
 * Game Icons' squirrel is used here (not the app's Font-Awesome family) because
 * it's a bold, solid, unmistakably-squirrel silhouette with a big bushy curled
 * tail — the exact opposite of an outline. It renders at ~2x critter scale in
 * the bonsai (well above icon size), where its extra character reads cleanly;
 * this is a different constraint from the frog mark, which must also survive at
 * a 16px favicon and so stays the simpler Font Awesome shape. Confirmed by
 * rendering all react-icons squirrels at bonsai scale with a separating halo —
 * the Octicons squirrel (previously used) read as a thin outline, this one
 * reads as a solid critter matching the frogs' weight.
 *
 * Path data: Game Icons "Squirrel" (https://game-icons.net/1x1/delapouite/squirrel.html),
 * CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ — via react-icons.
 */
export const SQUIRREL_ICON_VIEWBOX = "0 0 512 512";
export const SQUIRREL_ICON_PATH =
  "M206.135 23.568c-61.993.106-133.212 38.319-173.762 85.328 0 0 94.532-8.388 109.732 35.477 24.55 70.846-103.768 62.832-105.619 173.623-1.394 83.471 89.36 169.758 176.1 169.812 4.214 1.405 181.953 0 181.953 0 19.783-.28 20.606-22.551-48.812-36.637 145.592-147.853-86.742-159.073-85.456-45.779-17.956-18.803.577-99.816 97.692-95.832 32.91 23.48 51.817 27.373 88.56 19.284 6.982-1.537 12.05-25.665-5.462-27.064l-31.78-2.54c-28.106-25.677-34.818-36.477-6.67-57.463 68.87 18.058 77.047 12.076 77.016-13.33-.03-24.855-9.527-90.633-65.832-93.815-7.701-10.311 9.79-42.042-3.953-42.957-19.014-1.266-50.482 28.417-46.266 43.787-18.335 7.755-38.728 31.156-59.15 59.614-69.316 25.43-119.49 142.639-120.15 170.632-.579-182.435 153.242-180.594 140.216-244.77-14.07-69.324-66.992-97.458-118.357-97.37zM432.807 169.97c7.164 0 12.972 5.808 12.972 12.973 0 7.164-5.808 12.972-12.972 12.972-7.165 0-12.973-5.808-12.973-12.972 0-7.165 5.808-12.973 12.973-12.973z";
