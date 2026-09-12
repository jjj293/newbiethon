"""
픽셀아트 아바타 생성 스크립트.
캐릭터를 16x32 그리드로 정의하고, 결과 화면용 아이콘 배지(8x8)를
캐릭터 오른쪽 위 여백에 겹치지 않게 배치해서 SVG로 렌더링한다.
"""

PIXEL = 14  # 픽셀 1칸 -> 실제 SVG에서 몇 px 정사각형으로 그릴지
CANVAS_W = 32  # 전체 캔버스 가로 칸 수
CANVAS_H = 32  # 전체 캔버스 세로 칸 수
CHAR_OFFSET_X = 8  # 16칸 폭 캐릭터를 32칸 캔버스 가운데에 두기 위한 오프셋

PALETTE = {
    "h": "#5C4433",  # 머리카락
    "s": "#F6CDA0",  # 피부
    "k": "#3B2E28",  # 눈/입 등 진한 포인트
    "t": "#8FBFB5",  # 상의(티셔츠)
    "p": "#6E8CAE",  # 바지(데님)
    "w": "#F2F2F0",  # 신발(흰색)
    "d": "#3B2E28",  # 신발 밑창
}


def row_from_segments(segments):
    row = "".join(ch * n for ch, n in segments)
    assert len(row) == 16, f"row length {len(row)} != 16: {segments}"
    return row


CHARACTER_ROWS = [
    row_from_segments([(".", 16)]),                                   # 0
    row_from_segments([(".", 16)]),                                   # 1
    row_from_segments([(".", 6), ("h", 4), (".", 6)]),                # 2 hair top
    row_from_segments([(".", 5), ("h", 6), (".", 5)]),                # 3
    row_from_segments([(".", 4), ("h", 8), (".", 4)]),                # 4
    row_from_segments([(".", 4), ("h", 2), ("s", 4), ("h", 2), (".", 4)]),  # 5
    row_from_segments([(".", 3), ("h", 1), ("s", 8), ("h", 1), (".", 3)]),  # 6
    row_from_segments([(".", 3), ("s", 10), (".", 3)]),               # 7
    row_from_segments([(".", 3), ("s", 3), ("k", 1), ("s", 2), ("k", 1), ("s", 3), (".", 3)]),  # 8 eyes
    row_from_segments([(".", 3), ("s", 4), ("k", 2), ("s", 4), (".", 3)]),  # 9 mouth
    row_from_segments([(".", 3), ("s", 10), (".", 3)]),               # 10 chin
    row_from_segments([(".", 5), ("s", 6), (".", 5)]),                # 11 jaw taper
    row_from_segments([(".", 6), ("s", 4), (".", 6)]),                # 12 neck
    row_from_segments([(".", 2), ("t", 12), (".", 2)]),               # 13 shoulders
    row_from_segments([(".", 1), ("t", 14), (".", 1)]),               # 14
    row_from_segments([("t", 16)]),                                   # 15
    row_from_segments([("t", 16)]),                                   # 16
    row_from_segments([("t", 16)]),                                   # 17
    row_from_segments([("t", 16)]),                                   # 18
    row_from_segments([("t", 2), ("s", 1), ("t", 10), ("s", 1), ("t", 2)]),  # 19 wrists
    row_from_segments([(".", 1), ("s", 2), ("t", 10), ("s", 2), (".", 1)]),  # 20 hands
    row_from_segments([(".", 2), ("t", 12), (".", 2)]),               # 21 waist
    row_from_segments([(".", 3), ("t", 10), (".", 3)]),               # 22 shirt hem
    row_from_segments([(".", 3), ("p", 4), (".", 2), ("p", 4), (".", 3)]),  # 23 legs
    row_from_segments([(".", 3), ("p", 4), (".", 2), ("p", 4), (".", 3)]),  # 24
    row_from_segments([(".", 3), ("p", 4), (".", 2), ("p", 4), (".", 3)]),  # 25
    row_from_segments([(".", 3), ("p", 4), (".", 2), ("p", 4), (".", 3)]),  # 26
    row_from_segments([(".", 3), ("p", 4), (".", 2), ("p", 4), (".", 3)]),  # 27
    row_from_segments([(".", 3), ("p", 4), (".", 2), ("p", 4), (".", 3)]),  # 28
    row_from_segments([(".", 2), ("w", 5), (".", 2), ("w", 5), (".", 2)]),  # 29 shoes
    row_from_segments([(".", 2), ("w", 5), (".", 2), ("w", 5), (".", 2)]),  # 30
    row_from_segments([(".", 2), ("d", 5), (".", 2), ("d", 5), (".", 2)]),  # 31 soles
]
assert len(CHARACTER_ROWS) == 32


def icon_rows(segments_list, width=8):
    rows = []
    for segments in segments_list:
        row = "".join(ch * n for ch, n in segments)
        assert len(row) == width, f"icon row length {len(row)} != {width}: {segments}"
        rows.append(row)
    assert len(rows) == 8
    return rows


ICONS = {
    "sleep": {
        "palette": {"m": "#F5D76E"},
        "rows": icon_rows([
            [(".", 8)],
            [(".", 2), ("m", 3), (".", 3)],
            [(".", 1), ("m", 5), (".", 2)],
            [("m", 3), (".", 5)],
            [("m", 3), (".", 5)],
            [(".", 1), ("m", 5), (".", 2)],
            [(".", 2), ("m", 3), (".", 3)],
            [(".", 8)],
        ]),
    },
    "social": {
        "palette": {"o": "#2B2620", "f": "#FFFFFF"},
        "rows": icon_rows([
            [(".", 1), ("o", 6), (".", 1)],
            [("o", 1), ("f", 6), ("o", 1)],
            [("o", 1), ("f", 6), ("o", 1)],
            [("o", 1), ("f", 6), ("o", 1)],
            [("o", 1), ("f", 6), ("o", 1)],
            [(".", 1), ("o", 4), (".", 1), ("o", 1), (".", 1)],
            [(".", 3), ("o", 1), (".", 4)],
            [(".", 2), ("o", 1), (".", 5)],
        ]),
    },
    "cleanliness": {
        "palette": {"n": "#8B5A2B", "y": "#E8C97A"},
        "rows": icon_rows([
            [(".", 5), ("n", 1), (".", 2)],
            [(".", 4), ("n", 1), (".", 3)],
            [(".", 3), ("n", 1), (".", 4)],
            [(".", 2), ("n", 1), (".", 5)],
            [(".", 1), ("y", 5), (".", 2)],
            [(".", 1), ("y", 5), (".", 2)],
            [("y", 7), (".", 1)],
            [(".", 8)],
        ]),
    },
    "noise": {
        "palette": {"k": "#2B2620"},
        "rows": icon_rows([
            [(".", 2), ("k", 4), (".", 2)],
            [(".", 1), ("k", 1), (".", 4), ("k", 1), (".", 1)],
            [(".", 1), ("k", 1), (".", 4), ("k", 1), (".", 1)],
            [("k", 2), (".", 4), ("k", 2)],
            [("k", 3), (".", 2), ("k", 3)],
            [("k", 3), (".", 2), ("k", 3)],
            [("k", 2), (".", 4), ("k", 2)],
            [(".", 8)],
        ]),
    },
    "conflict": {
        "palette": {"r": "#D9534F"},
        "rows": icon_rows([
            [(".", 3), ("r", 2), (".", 3)],
            [(".", 3), ("r", 2), (".", 3)],
            [(".", 3), ("r", 2), (".", 3)],
            [(".", 3), ("r", 2), (".", 3)],
            [(".", 8)],
            [(".", 3), ("r", 2), (".", 3)],
            [(".", 3), ("r", 2), (".", 3)],
            [(".", 8)],
        ]),
    },
    "privacy": {
        "palette": {"k": "#2B2620", "g": "#B9B9B4"},
        "rows": icon_rows([
            [(".", 2), ("k", 4), (".", 2)],
            [(".", 1), ("k", 1), (".", 4), ("k", 1), (".", 1)],
            [(".", 1), ("k", 1), (".", 4), ("k", 1), (".", 1)],
            [("k", 8)],
            [("k", 1), ("g", 6), ("k", 1)],
            [("k", 1), ("g", 2), ("k", 2), ("g", 2), ("k", 1)],
            [("k", 1), ("g", 6), ("k", 1)],
            [("k", 8)],
        ]),
    },
}


def render_svg(character_rows, icon=None, icon_offset=(23, 0), icon_pixel=None):
    icon_pixel = icon_pixel or PIXEL
    width_px = CANVAS_W * PIXEL
    height_px = CANVAS_H * PIXEL

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width_px}" height="{height_px}" '
        f'viewBox="0 0 {width_px} {height_px}" shape-rendering="crispEdges">'
    ]

    # 캐릭터 그리기
    for y, row in enumerate(character_rows):
        for x, ch in enumerate(row):
            if ch == ".":
                continue
            color = PALETTE[ch]
            px = (x + CHAR_OFFSET_X) * PIXEL
            py = y * PIXEL
            parts.append(f'<rect x="{px}" y="{py}" width="{PIXEL}" height="{PIXEL}" fill="{color}"/>')

    # 아이콘 배지 그리기 (있으면)
    if icon is not None:
        icon_def = ICONS[icon]
        ox, oy = icon_offset
        for y, row in enumerate(icon_def["rows"]):
            for x, ch in enumerate(row):
                if ch == ".":
                    continue
                color = icon_def["palette"][ch]
                px = (ox + x) * PIXEL
                py = (oy + y) * PIXEL
                parts.append(f'<rect x="{px}" y="{py}" width="{PIXEL}" height="{PIXEL}" fill="{color}"/>')

    parts.append("</svg>")
    return "\n".join(parts)


def main():
    import os

    out_dir = os.path.dirname(os.path.abspath(__file__))

    # 기본 아바타 (시뮬레이션 중 항상 이 모습)
    with open(os.path.join(out_dir, "avatar_default.svg"), "w", encoding="utf-8") as f:
        f.write(render_svg(CHARACTER_ROWS))

    # 결과 화면용: trait별 아이콘 배지 버전
    for trait in ICONS:
        with open(os.path.join(out_dir, f"avatar_{trait}.svg"), "w", encoding="utf-8") as f:
            f.write(render_svg(CHARACTER_ROWS, icon=trait))

    print("생성 완료:", os.listdir(out_dir))


if __name__ == "__main__":
    main()
