// Script generating mapBoxes.conf used by SPADS and BYAR-Chobby repo.

import { readMapList } from './maps_metadata.js';
import fs from 'node:fs/promises';
import { program } from '@commander-js/extra-typings';
import { MapList, Startbox } from '../../../gen/types/map_list.js';

const HEADER = `#
# AUTOMATICALLY GENERATED FILE, DO NOT EDIT!
#
# This file is automatically generated from the beyond-all-reason/maps-metadata repository and any
# changes here will be overridden by the next update. If you want to make any changes please follow
# https://github.com/beyond-all-reason/maps-metadata/wiki/Adding-a-created-map-to-the-game
#
################################################################################
#
# Input field description:
# ------------------------
#
# mapName: name of the map with smf extension (string)
# nbTeams: number of teams
#
# Output fields description:
# --------------------------
#
# boxes: Split description (string)
#   h <size> -> split horizontally (boxes height=<size>)
#   v <size> -> split vertically (boxes width=<size>)
#   c1 <size> -> split on top left and bottom right corners (boxes sides=<size>)
#   c2 <size> -> split on top right and bottom left corners (boxes sides=<size>)
#   c <size> -> split on corners (boxes sides=<size>)
#   s <size> -> split on sides (boxes sides=<size>)
#   <addboxes parameters sets> -> refer to "addbox" command help
#     (example: "0 0 50 50;150 150 200 200;0 150 50 200;150 0 200 50")
#
################################################################################
#
#?mapName:nbTeams|boxes
`;

function serializeStartboxes(startboxes: Startbox[]): string {
    return startboxes
        .map(s => s.poly.map(p => `${p.x} ${p.y}`).join(' '))
        .join(';');
}

function buildMapBoxes(maps: MapList): string {
    return Object.values(maps)
        .sort((a, b) => a.springName.localeCompare(b.springName))
        .flatMap(m => Object.values(m.startboxesSet || {})
            .map(s => s.startboxes)
            .sort((a, b) => a.length - b.length)
            .map(s => `${m.springName}.smf:${s.length}|${serializeStartboxes(s)}`)
        )
        .join('\n');
}

const prog = program
    .argument('<mapBoxes>', 'Map boxes output.')
    .parse();
const [mapBoxesPath] = prog.processedArgs;
await fs.writeFile(mapBoxesPath, HEADER + buildMapBoxes(await readMapList()) + '\n');
