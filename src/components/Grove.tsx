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
import SandSnapshotLightbox from "@/components/SandSnapshotLightbox";
import { blossomCountForLeaves, bonsaiStageLabel, type BonsaiStage } from "@/lib/bonsai";
import { archiveEntryLabel, useArchive, type ArchivedDay } from "@/lib/dayArchive";
import { useGroveVisibility } from "@/lib/grove";
import { useTodaySandSnapshot } from "@/lib/sand";

const SCENE_SIZE = 104;
const SAND_THUMB_SIZE = 88;

/**
 * The Grove (specs/010-grove-history + 011-sand-day-snapshots): calm history of
 * archived days as bonsai scenes, plus optional sand keepsake thumbnails and a
 * Today entry when the live day has a latest sand snapshot.
 */
export default function Grove() {
  const archive = useArchive();
  const [visible, setVisible] = useGroveVisibility();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<ArchivedDay | null>(null);
  const todaySand = useTodaySandSnapshot();
  const [sandLightbox, setSandLightbox] = useState<{ src: string; label: string } | null>(null);

  // How many entries share each date — drives same-date time disambiguation,
  // consistent with the export menu's labelling (FR-003).
  const dateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of archive) counts.set(day.date, (counts.get(day.date) ?? 0) + 1);
    return counts;
  }, [archive]);

  const selectedSameDateCount = selected ? (dateCounts.get(selected.date) ?? 1) : 1;
  const showEmptyCopy = archive.length === 0 && !todaySand;

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
                {todaySand && (
                  <Box role="listitem" sx={{ flexShrink: 0 }}>
                    <Button
                      onClick={() =>
                        setSandLightbox({ src: todaySand, label: "Sand drawing for Today" })
                      }
                      aria-label="Sand drawing for Today"
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
                        component="img"
                        src={todaySand}
                        alt=""
                        aria-hidden
                        sx={{
                          width: SAND_THUMB_SIZE,
                          height: SAND_THUMB_SIZE,
                          objectFit: "cover",
                          borderRadius: 1.5,
                          display: "block",
                          bgcolor: "action.hover",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Today
                      </Typography>
                    </Button>
                  </Box>
                )}

                {archive.map((day) => {
                  const label = archiveEntryLabel(day, dateCounts.get(day.date) ?? 1);
                  const stage = day.bonsai.stage as BonsaiStage;
                  const hasSand = typeof day.sandSnapshot === "string" && day.sandSnapshot.length > 0;
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
                        {hasSand && (
                          <Button
                            onClick={() =>
                              setSandLightbox({
                                src: day.sandSnapshot!,
                                label: `Sand drawing for ${label}`,
                              })
                            }
                            aria-label={`Sand drawing for ${label}`}
                            color="inherit"
                            size="small"
                            sx={{
                              p: 0.5,
                              textTransform: "none",
                              borderRadius: 1.5,
                              minWidth: 0,
                            }}
                          >
                            <Box
                              component="img"
                              src={day.sandSnapshot}
                              alt=""
                              aria-hidden
                              sx={{
                                width: 56,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 1,
                                display: "block",
                              }}
                            />
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
        src={sandLightbox?.src ?? null}
        label={sandLightbox?.label ?? ""}
        onClose={() => setSandLightbox(null)}
      />
    </Card>
  );
}
