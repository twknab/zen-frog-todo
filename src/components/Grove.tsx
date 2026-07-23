"use client";

import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ForestOutlinedIcon from "@mui/icons-material/ForestOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import BonsaiTree from "@/components/BonsaiTree";
import GroveDayDialog from "@/components/GroveDayDialog";
import SandSnapshotLightbox, { type SandLightboxItem } from "@/components/SandSnapshotLightbox";
import { blossomCountForLeaves, bonsaiStageLabel, type BonsaiStage } from "@/lib/bonsai";
import { archiveEntryLabel, useArchive, type ArchivedDay } from "@/lib/dayArchive";
import { useGroveVisibility } from "@/lib/grove";
import {
  drawingsFromArchivedDay,
  sandSvgDataUrl,
  useTodaySandDrawings,
} from "@/lib/sand";

const SCENE_SIZE = 104;
const SAND_THUMB_SIZE = 88;
const STACK_PEEK = 3;

/**
 * The Grove (specs/010-grove-history + 011-sand-day-snapshots): calm history of
 * archived days as bonsai scenes, plus sand drawing stacks (all of today's
 * clears, and a peek under each archived day that had sand).
 */
export default function Grove() {
  const archive = useArchive();
  const [visible, setVisible] = useGroveVisibility();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<ArchivedDay | null>(null);
  const todayDrawings = useTodaySandDrawings();
  const [sandLightbox, setSandLightbox] = useState<{
    items: SandLightboxItem[];
    index: number;
    label: string;
  } | null>(null);

  const dateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of archive) counts.set(day.date, (counts.get(day.date) ?? 0) + 1);
    return counts;
  }, [archive]);

  const selectedSameDateCount = selected ? (dateCounts.get(selected.date) ?? 1) : 1;
  const showEmptyCopy = archive.length === 0 && todayDrawings.length === 0;

  const todayItems: SandLightboxItem[] = useMemo(
    () =>
      todayDrawings.map((d) => ({
        id: d.id,
        src: sandSvgDataUrl(d.svg),
        drawing: d,
      })),
    [todayDrawings],
  );

  return (
    <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <ForestOutlinedIcon color="success" />
            <Typography variant="h6" component="h2">
              The Grove
            </Typography>
          </Stack>
          <Button
            onClick={() => setVisible((v) => !v)}
            aria-expanded={visible}
            aria-controls="grove-ribbon"
            color="inherit"
            size="small"
            endIcon={visible ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
            sx={{ color: "text.secondary", textTransform: "none", flexShrink: 0 }}
          >
            {visible ? "Hide the Grove" : "Show the Grove"}
          </Button>
        </Stack>

        <Collapse in={visible} timeout={reduce ? 0 : undefined} unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {showEmptyCopy ? (
              <Typography variant="body2" color="text.secondary">
                Your grove is still a clearing. Close a day and its first little tree will
                take root here.
              </Typography>
            ) : (
              <Box
                id="grove-ribbon"
                role="list"
                aria-label="Days and sand keepsakes, newest first"
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 1.5,
                  scrollbarWidth: "thin",
                  scrollBehavior: reduce ? "auto" : "smooth",
                  "&::-webkit-scrollbar": { height: 8 },
                  "&::-webkit-scrollbar-thumb": {
                    borderRadius: 8,
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {todayItems.length > 0 && (
                  <Box role="listitem" sx={{ flexShrink: 0 }}>
                    <Button
                      onClick={() =>
                        setSandLightbox({
                          items: todayItems,
                          index: todayItems.length - 1,
                          label: "Sand drawings for Today",
                        })
                      }
                      aria-label={
                        todayItems.length === 1
                          ? "Sand drawing for Today"
                          : `${todayItems.length} sand drawings for Today`
                      }
                      color="inherit"
                      sx={{
                        p: 1,
                        textTransform: "none",
                        borderRadius: 2,
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <SandStackPeek
                        srcs={todayItems.map((i) => i.src)}
                        size={SAND_THUMB_SIZE}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Today
                        {todayItems.length > 1 ? ` · ${todayItems.length}` : ""}
                      </Typography>
                    </Button>
                  </Box>
                )}

                {archive.map((day) => {
                  const label = archiveEntryLabel(day, dateCounts.get(day.date) ?? 1);
                  const stage = day.bonsai.stage as BonsaiStage;
                  const sand = drawingsFromArchivedDay(day);
                  return (
                    <Box key={day.id} role="listitem" sx={{ flexShrink: 0 }}>
                      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                        <Button
                          onClick={() => setSelected(day)}
                          aria-label={`${label} — ${bonsaiStageLabel(stage)}`}
                          color="inherit"
                          sx={{
                            p: 1,
                            textTransform: "none",
                            borderRadius: 2,
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            aria-hidden="true"
                            sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                          >
                            <BonsaiTree
                              stage={stage}
                              leaves={day.bonsai.leaves}
                              blossoms={blossomCountForLeaves(day.bonsai.leaves)}
                              size={SCENE_SIZE}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {label}
                            </Typography>
                          </Box>
                        </Button>
                        {sand.length > 0 && (
                          <Button
                            onClick={() =>
                              setSandLightbox({
                                items: sand.map((s) => ({
                                  id: s.id,
                                  src: s.src,
                                  drawing: s.drawing,
                                })),
                                index: sand.length - 1,
                                label: `Sand drawings for ${label}`,
                              })
                            }
                            aria-label={
                              sand.length === 1
                                ? `Sand drawing for ${label}`
                                : `${sand.length} sand drawings for ${label}`
                            }
                            color="inherit"
                            size="small"
                            sx={{
                              p: 0.5,
                              textTransform: "none",
                              borderRadius: 1.5,
                              minWidth: 0,
                              flexDirection: "column",
                            }}
                          >
                            <SandStackPeek srcs={sand.map((s) => s.src)} size={56} />
                            {sand.length > 1 && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                                {sand.length}
                              </Typography>
                            )}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <GroveDayDialog
        day={selected}
        sameDateCount={selectedSameDateCount}
        onClose={() => setSelected(null)}
      />

      <SandSnapshotLightbox
        items={sandLightbox?.items ?? []}
        index={sandLightbox?.index ?? null}
        label={sandLightbox?.label ?? ""}
        onClose={() => setSandLightbox(null)}
        onIndexChange={(i) =>
          setSandLightbox((prev) => (prev ? { ...prev, index: i } : prev))
        }
      />
    </Card>
  );
}

/** Soft stacked peek of recent drawings — rounded bordered cards, latest on top. */
function SandStackPeek({ srcs, size }: { srcs: string[]; size: number }) {
  const shown = srcs.slice(-STACK_PEEK);
  const layers = shown.length;
  // Enough offset that each card edge reads as a distinct layer.
  const step = layers > 1 ? 5 : 0;
  const stackPad = step * (layers - 1);

  return (
    <Box
      sx={{
        position: "relative",
        width: size + stackPad,
        height: size + stackPad,
      }}
    >
      {shown.map((src, i) => {
        const fromTop = i; // oldest further back
        const offset = (layers - 1 - fromTop) * step;
        return (
          <Box
            key={`${src.slice(0, 24)}-${i}`}
            aria-hidden
            sx={{
              position: "absolute",
              left: offset,
              top: offset,
              width: size,
              height: size,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 1,
              zIndex: fromTop + 1,
            }}
          >
            <Box
              component="img"
              src={src}
              alt=""
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
