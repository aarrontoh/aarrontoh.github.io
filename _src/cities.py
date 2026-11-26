"""City options for each visited country, with coordinates (lat, lon) for the map.
The quiz offers these; his picks (plus any he types) become pins."""

OPTIONS = {
    "Italy": [("Rome", 41.90, 12.50), ("Milan", 45.46, 9.19), ("Venice", 45.44, 12.33), ("Florence", 43.77, 11.26),
              ("Dolomites (Val Gardena / Cortina)", 46.55, 11.85), ("Lake Como", 45.99, 9.26), ("Amalfi Coast / Naples", 40.63, 14.60),
              ("Pisa", 43.72, 10.40), ("Verona", 45.44, 10.99), ("Bolzano", 46.50, 11.35)],
    "Norway": [("Oslo", 59.91, 10.75), ("Bergen", 60.39, 5.32), ("Tromsø", 69.65, 18.96), ("Lofoten", 68.23, 13.98),
               ("Stavanger / Preikestolen", 58.97, 5.73), ("Geiranger / Flåm", 62.10, 7.21), ("Ålesund", 62.47, 6.15)],
    "Sweden": [("Stockholm", 59.33, 18.07), ("Gothenburg", 57.71, 11.97), ("Kiruna / Abisko", 67.86, 20.23), ("Malmö", 55.60, 13.00), ("Uppsala", 59.86, 17.64)],
    "Finland": [("Helsinki", 60.17, 24.94), ("Rovaniemi", 66.50, 25.73), ("Lapland (Levi / Saariselkä)", 67.80, 24.81), ("Turku", 60.45, 22.27)],
    "Iceland": [("Reykjavík", 64.15, -21.94), ("Golden Circle", 64.33, -20.12), ("Vík / South Coast", 63.42, -19.01),
                ("Jökulsárlón", 64.05, -16.18), ("Akureyri", 65.68, -18.09), ("Snæfellsnes", 64.87, -23.62)],
    "Bulgaria": [("Sofia", 42.70, 23.32), ("Plovdiv", 42.14, 24.75), ("Varna", 43.21, 27.91), ("Bansko", 41.84, 23.49), ("Rila Monastery", 42.13, 23.34)],
    "Czechia": [("Prague", 50.08, 14.44), ("Český Krumlov", 48.81, 14.32), ("Brno", 49.20, 16.61), ("Karlovy Vary", 50.23, 12.87), ("Kutná Hora", 49.95, 15.27)],
    "Hungary": [("Budapest", 47.50, 19.04), ("Lake Balaton", 46.83, 17.73), ("Eger", 47.90, 20.37)],
    "Austria": [("Vienna", 48.21, 16.37), ("Salzburg", 47.81, 13.06), ("Hallstatt", 47.56, 13.65), ("Innsbruck", 47.27, 11.40), ("Graz", 47.07, 15.44)],
    "Switzerland": [("Zurich", 47.38, 8.54), ("Geneva", 46.20, 6.14), ("Lucerne", 47.05, 8.31), ("Interlaken", 46.69, 7.86),
                    ("Zermatt", 46.02, 7.75), ("Grindelwald", 46.62, 8.04), ("Lauterbrunnen", 46.59, 7.91), ("Bern", 46.95, 7.45)],
    "Netherlands": [("Amsterdam", 52.37, 4.90), ("Rotterdam", 51.92, 4.48), ("The Hague", 52.07, 4.30), ("Utrecht", 52.09, 5.12),
                    ("Zaanse Schans", 52.47, 4.82), ("Giethoorn", 52.74, 6.08)],
    "Japan": [("Tokyo", 35.68, 139.69), ("Osaka", 34.69, 135.50), ("Kyoto", 35.01, 135.77), ("Nara", 34.69, 135.80),
              ("Mt Fuji / Kawaguchiko", 35.50, 138.76), ("Hokkaido (Sapporo)", 43.06, 141.35), ("Fukuoka", 33.59, 130.40),
              ("Hiroshima", 34.39, 132.46), ("Okinawa", 26.21, 127.68), ("Nagoya", 35.18, 136.91)],
    "South Korea": [("Seoul", 37.57, 126.98), ("Busan", 35.18, 129.08), ("Jeju", 33.50, 126.53), ("Gyeongju", 35.86, 129.22), ("Incheon", 37.46, 126.71)],
    "Taiwan": [("Taipei", 25.03, 121.57), ("Jiufen", 25.11, 121.84), ("Taichung", 24.15, 120.67), ("Tainan", 22.99, 120.21),
               ("Kaohsiung", 22.63, 120.30), ("Hualien / Taroko", 24.16, 121.62)],
    "China": [("Hangzhou", 30.27, 120.16), ("Beijing", 39.90, 116.40), ("Shanghai", 31.23, 121.47), ("Guangzhou", 23.13, 113.26),
              ("Shenzhen", 22.54, 114.06), ("Chengdu", 30.57, 104.07), ("Chongqing", 29.56, 106.55), ("Xi'an", 34.34, 108.94),
              ("Zhangjiajie", 29.12, 110.48), ("Harbin", 45.80, 126.53)],
    "Indonesia": [("Bali", -8.65, 115.22), ("Batam", 1.13, 104.05), ("Bintan", 1.08, 104.48), ("Jakarta", -6.21, 106.85),
                  ("Yogyakarta", -7.80, 110.36), ("Bandung", -6.92, 107.61), ("Lombok", -8.65, 116.32)],
    "Thailand": [("Bangkok", 13.76, 100.50), ("Chiang Mai", 18.79, 98.98), ("Phuket", 7.88, 98.39), ("Krabi", 8.09, 98.91),
                 ("Pattaya", 12.93, 100.88), ("Hat Yai", 7.01, 100.47), ("Koh Samui", 9.51, 100.01)],
    "Laos": [("Vientiane", 17.98, 102.63), ("Luang Prabang", 19.89, 102.13), ("Vang Vieng", 18.92, 102.45)],
    "Vietnam": [("Ho Chi Minh City", 10.82, 106.63), ("Hanoi", 21.03, 105.85), ("Da Nang", 16.05, 108.20), ("Hoi An", 15.88, 108.33),
                ("Ha Long Bay", 20.91, 107.18), ("Sapa", 22.34, 103.84), ("Nha Trang", 12.24, 109.19), ("Da Lat", 11.94, 108.46)],
    "Malaysia": [("Kuala Lumpur", 3.14, 101.69), ("Johor Bahru", 1.49, 103.74), ("Malacca", 2.19, 102.25), ("Penang", 5.41, 100.33),
                 ("Genting Highlands", 3.42, 101.79), ("Langkawi", 6.35, 99.80), ("Ipoh", 4.60, 101.09),
                 ("Cameron Highlands", 4.47, 101.38), ("Kota Kinabalu", 5.98, 116.07)],
}
HOME = ("Singapore", 1.35, 103.82)

# His picks from the city quiz (26 Nov 2026). The Netherlands had none picked:
# it stays lit as a country, with no pin, rather than a guessed city.
VISITED_CITIES = {
    "Austria": ["Vienna", "Salzburg", "Hallstatt"],
    "Bulgaria": ["Sofia"],
    "China": ["Hangzhou"],
    "Czechia": ["Prague"],
    "Finland": ["Rovaniemi"],
    "Hungary": ["Budapest"],
    "Iceland": ["Reykjavík", "Golden Circle", "Vík / South Coast", "Akureyri", "Snæfellsnes"],
    "Indonesia": ["Batam", "Bintan"],
    "Italy": ["Venice", "Dolomites (Val Gardena / Cortina)", "Amalfi Coast / Naples"],
    "Japan": ["Tokyo", "Hokkaido (Sapporo)"],
    "Laos": ["Vientiane"],
    "Malaysia": ["Kuala Lumpur", "Johor Bahru", "Malacca", "Penang", "Genting Highlands", "Langkawi", "Ipoh"],
    "Norway": ["Oslo", "Bergen", "Lofoten", "Geiranger / Flåm", "Ålesund"],
    "South Korea": ["Seoul"],
    "Sweden": ["Stockholm", "Gothenburg", "Malmö"],
    "Switzerland": ["Zurich", "Interlaken", "Grindelwald", "Lauterbrunnen"],
    "Taiwan": ["Taipei", "Jiufen", "Taichung"],
    "Thailand": ["Bangkok", "Chiang Mai"],
    "Vietnam": ["Ho Chi Minh City", "Hanoi"],
}
# Typed in by him: (country, name, lat, lon)
EXTRA_CITIES = [
    ("Sweden", "Jönköping", 57.78, 14.16),
    ("Sweden", "Lund", 55.70, 13.19),
    ("Sweden", "Gränna", 58.03, 14.46),
    ("Switzerland", "Spiez", 46.69, 7.68),
]
