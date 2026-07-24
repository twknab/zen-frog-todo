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
 * The bonsai's occasional squirrel visitor. Font Awesome has no squirrel
 * icon, so this uses GitHub Octicons instead — the closest match in weight
 * and style (bold single-color solid fill), confirmed at true 16px against
 * Game Icons' considerably more detailed alternative, which lost definition
 * at that size the same way Game Icons' frog did.
 *
 * Path data: Octicons "squirrel" (https://primer.style/foundations/icons/squirrel-16),
 * MIT License — via react-icons.
 */
export const SQUIRREL_ICON_VIEWBOX = "0 0 24 24";
export const SQUIRREL_ICON_PATH =
  "M18.377 3.49c-1.862-.31-3.718.62-4.456 2.095-.428.857-.691 1.624-.728 2.361-.035.71.138 1.444.67 2.252.644.854 1.199 1.913 1.608 3.346a.75.75 0 1 1-1.442.412c-.353-1.236-.82-2.135-1.372-2.865l-.008-.01c-.53-.698-1.14-1.242-1.807-1.778a50.724 50.724 0 0 0-.667-.524C9.024 7.884 7.71 6.863 6.471 5.16c-.59.287-1.248.798-1.806 1.454-.665.78-1.097 1.66-1.158 2.446.246.36.685.61 1.246.715.643.12 1.278.015 1.633-.182a.75.75 0 1 1 .728 1.311c-.723.402-1.728.516-2.637.346-.916-.172-1.898-.667-2.398-1.666L2 9.427V9.25c0-1.323.678-2.615 1.523-3.607.7-.824 1.59-1.528 2.477-1.917V2.75a.75.75 0 1 1 1.5 0v1.27c1.154 1.67 2.363 2.612 3.568 3.551.207.162.415.323.621.489.001-.063.003-.126.006-.188.052-1.034.414-2.017.884-2.958 1.06-2.118 3.594-3.313 6.044-2.904 1.225.204 2.329.795 3.125 1.748C22.546 4.713 23 5.988 23 7.5c0 1.496-.913 3.255-2.688 3.652.838 1.699 1.438 3.768 1.181 5.697-.269 2.017-1.04 3.615-2.582 4.675C17.409 22.558 15.288 23 12.5 23H4.75a.75.75 0 0 1 0-1.5h2.322c-.58-.701-.998-1.578-1.223-2.471-.327-1.3-.297-2.786.265-4.131-.92.091-1.985-.02-3.126-.445a.75.75 0 1 1 .524-1.406c1.964.733 3.428.266 4.045-.19.068-.06.137-.12.208-.18a.745.745 0 0 1 .861-.076.746.746 0 0 1 .32.368.752.752 0 0 1-.173.819c-.077.076-.16.15-.252.221-1.322 1.234-1.62 3.055-1.218 4.654.438 1.737 1.574 2.833 2.69 2.837H12.5c2.674 0 4.429-.433 5.56-1.212 1.094-.752 1.715-1.904 1.946-3.637.236-1.768-.445-3.845-1.407-5.529a.576.576 0 0 1-.012-.02 3.557 3.557 0 0 1-1.553-.94c-.556-.565-.89-1.243-1.012-1.73a.75.75 0 0 1 1.456-.364c.057.231.26.67.626 1.043.35.357.822.623 1.443.623 1.172 0 1.953-1.058 1.953-2.234 0-1.205-.357-2.127-.903-2.78-.547-.654-1.318-1.08-2.22-1.23Z";
