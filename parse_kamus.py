import re
import json

def main():
    with open("SagaHealth_temp/partials/kamus_kesehatan.php", "r", encoding="utf-8") as f:
        text = f.read()

    penyakit_text = text.split('$penyakit = [')[1].split('];')[0]
    obat_text = text.split('$obat = [')[1].split('];')[0]

    def parse_arr(t):
        res = []
        lines = t.strip().split('\n')
        for l in lines:
            if '=>' in l:
                nama_match = re.search(r"'nama'\s*=>\s*'([^']+)'", l)
                abjad_match = re.search(r"'abjad'\s*=>\s*'([^']+)'", l)
                if nama_match:
                    obj = {"nama": nama_match.group(1)}
                    if abjad_match:
                        obj["abjad"] = abjad_match.group(1)
                    res.append(obj)
        return res

    penyakit = parse_arr(penyakit_text)
    obat = parse_arr(obat_text)

    with open("src/kamusData.json", "w", encoding="utf-8") as f:
        json.dump({"penyakit": penyakit, "obat": obat}, f, indent=2)

    print(f"Extracted {len(penyakit)} penyakit and {len(obat)} obat.")

if __name__ == '__main__':
    main()
