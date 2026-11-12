/* Maps page content: one entry per plate, in book order.
   To add a map: build its images with build_plates.py, then add an entry here.
   Fields
     id        slug used in the URL (#id) and in the image names: maps/img/<id>.webp, <id>-950.webp, <id>-thumb.webp
     no        plate number shown in the book (roman)
     tab, sub  the two lines on the page tab (keep both short)
     alt       what the map shows, for screen readers
     title, summary
     insights  [bold lead, explanation] pairs, three or four
     data      [label, value] rows; a third item marks the value as still to confirm
     fact      one curious fact about the map
   Every claim here has to be true and checkable (see MASTER.md, content rule). */
window.PLATES = [
    {
        id: 'basins', no: 'I', tab: 'River basins', sub: '14 basins',
        alt: 'Map of New England with every river coloured by the basin it belongs to',
        title: 'River basins',
        summary: 'Every river in New England, coloured by the basin it drains into. HydroBASINS splits the region into 14 units at Pfafstetter level 5. Each colour is one of them, and thicker lines are bigger rivers.',
        insights: [
            ['The Connecticut is the spine.', 'Its basin (green) runs the full height of the region, from the Canadian border to Long Island Sound, across four states.'],
            ['Not all of it reaches the New England coast.', 'Western Vermont (pink) drains north through Lake Champlain to the St. Lawrence, and northern Maine (peach) leaves through the St. John into Canada.'],
            ['Water ignores state lines.', 'The thin black borders cut straight through almost every colour on the map.'],
            ['Two systems drain Maine\'s interior.', 'The Penobscot (mint) and the Kennebec–Androscoggin (purple), which reach the sea through one shared outlet.'],
        ],
        data: [
            ['Basins', '14, Pfafstetter level 5'],
            ['Area', '6 states'],
            ['Longest river', 'Connecticut, about 650 km'],
            ['Data', 'HydroBASINS v1c · HydroRIVERS v1.0 · US Census Bureau'],
            ['Built with', 'Python · matplotlib'],
        ],
        fact: 'The Connecticut River is the border between Vermont and New Hampshire, but the line follows the Vermont bank. The river itself belongs to New Hampshire.',
    },
    {
        id: 'order', no: 'II', tab: 'Stream order', sub: 'Strahler rank',
        alt: 'Map of New England with rivers drawn brighter and thicker the higher their Strahler stream order',
        title: 'Rivers by stream order',
        summary: 'The same rivers with the basins taken away. Colour and line weight now follow Strahler stream order: a stream only moves up a rank where two of the same rank meet, so the brightest, thickest lines are the main stems.',
        insights: [
            ['A handful of trunks carry the region.', 'The Connecticut, Merrimack, Kennebec, Androscoggin and Penobscot stand out as the bright lines.'],
            ['Most of the network is small.', 'Dark-blue headwater streams far outnumber the bright ones.'],
            ['The big rivers run north to south.', 'They follow the valleys down to the Atlantic and Long Island Sound.'],
            ['Lay it over Plate I.', 'Each bright trunk here is the backbone of one coloured basin there.'],
        ],
        data: [
            ['Attribute', 'Strahler order (ORD_STRA)'],
            ['Area', '6 states'],
            ['River segments', '15,819'],
            ['Data', 'HydroRIVERS v1.0 · US Census Bureau'],
            ['Built with', 'Python · matplotlib'],
        ],
        fact: 'The bright line along Vermont\'s western edge is not a river. It is Lake Champlain: the dataset draws a flow line through lakes, and this one carries water north to Canada.',
    },
];
