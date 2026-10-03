import { Router, Request, Response } from "express";
import { db } from "../db";

export function batteriesRouter() {
  const router = Router();

  /**
   * GET /api/batteries/export
   *
   * Exports batteries grouped by plane for use with EdgeTX BatteryID widget.
   * The output is a Lua file that can be placed on the SD card.
   *
   * Query params:
   *   - format: "lua" (default) or "json"
   */
  router.get("/export", async (req: Request, res: Response) => {
    const format = req.query.format || "lua";

    try {
      // Get all batteries with their plane associations
      const batteries = await db.any(`
        SELECT 
          b.id,
          b.name,
          b.type,
          b.cells,
          b.capacity,
          COALESCE(
            json_agg(DISTINCT pb.plane_id) FILTER (WHERE pb.plane_id IS NOT NULL),
            '[]'
          ) as planes
        FROM batteries b
        LEFT JOIN plane_batteries pb ON pb.battery_name = b.name
        WHERE b.retirement_date IS NULL
        GROUP BY b.id, b.name, b.type, b.cells, b.capacity
        ORDER BY b.name
      `);

      // Group batteries by plane
      const byPlane: Record<string, Array<{ id: number; name: string }>> = {};

      for (const bat of batteries) {
        const planes = bat.planes as string[];
        for (const planeId of planes) {
          if (!byPlane[planeId]) {
            byPlane[planeId] = [];
          }
          byPlane[planeId].push({ id: bat.id, name: bat.name });
        }
      }

      if (format === "json") {
        res.json(byPlane);
      } else {
        // Generate Lua format for EdgeTX
        const lua = generateLuaExport(byPlane);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="batteries.lua"',
        );
        res.send(lua);
      }
    } catch (err) {
      console.error("Battery export failed:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
}

/**
 * Generates a Lua file containing battery data for the EdgeTX widget.
 * Format:
 *   return {
 *     ["PlaneName"] = {
 *       { id = 1, name = "Battery-A" },
 *       { id = 2, name = "Battery-B" },
 *     },
 *   }
 */
function generateLuaExport(
  byPlane: Record<string, Array<{ id: number; name: string }>>,
): string {
  const lines: string[] = [
    "-- Battery data exported from Logbook",
    "-- Place this file in /WIDGETS/BatteryID/batteries.lua",
    `-- Generated: ${new Date().toISOString()}`,
    "",
    "return {",
  ];

  for (const [planeId, batteries] of Object.entries(byPlane)) {
    lines.push(`  ["${escapeLuaString(planeId)}"] = {`);
    for (const bat of batteries) {
      lines.push(
        `    { id = ${bat.id}, name = "${escapeLuaString(bat.name)}" },`,
      );
    }
    lines.push("  },");
  }

  lines.push("}");
  return lines.join("\n");
}

function escapeLuaString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
