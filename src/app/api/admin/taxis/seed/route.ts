import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const TAXI_RATES = [
  {
    place: "LOCAL PAHALGAM FULL DAY",
    rates: { CRYSTA: 4900, INNOVA: 4700, ERTIGA: 4100, TAVERA: 4400, ETIOS: 4100, SWIFT: 4000, ECCO: 3900, ALTO: 3800, SUMO: , BOLERO: 0 }
  },
  {
    place: "ARU CHANDANWARI BETAAB VALLEY",
    rates: { CRYSTA: 3800, INNOVA: 3600, ERTIGA: 3100, TAVERA: 3200, ETIOS: 3100, SWIFT: 3000, ECCO: 2900, ALTO: 2800, SUMO: , BOLERO: 0 }
  },
  {
    place: "ARU BETAAB VALLEY",
    rates: { CRYSTA: 3100, INNOVA: 2900, ERTIGA: 2700, TAVERA: 2700, ETIOS: 2700, SWIFT: 2600, ECCO: 2400, ALTO: 2300, SUMO: , BOLERO: 0 }
  },
  {
    place: "ARU CHANDANWARI",
    rates: { CRYSTA: 3400, INNOVA: 3200, ERTIGA: 2800, TAVERA: 2900, ETIOS: 2800, SWIFT: 2700, ECCO: 2600, ALTO: 2500, SUMO: , BOLERO: 0 }
  },
  {
    place: "CHANDANWARI BETAAB VALLEY",
    rates: { CRYSTA: 2900, INNOVA: 2700, ERTIGA: 2300, TAVERA: 2400, ETIOS: 2300, SWIFT: 2200, ECCO: 2100, ALTO: 2000, SUMO: , BOLERO: 0 }
  },
  {
    place: "CHANDANWARI",
    rates: { CRYSTA: 2600, INNOVA: 2400, ERTIGA: 2200, TAVERA: 2200, ETIOS: 2200, SWIFT: 2100, ECCO: 2000, ALTO: 1900, SUMO: , BOLERO: 0 }
  },
  {
    place: "ARU VALLEY",
    rates: { CRYSTA: 2600, INNOVA: 2400, ERTIGA: 2200, TAVERA: 2200, ETIOS: 2200, SWIFT: 2100, ECCO: 1900, ALTO: 1800, SUMO: , BOLERO: 0 }
  },
  {
    place: "BETAAB VALLEY",
    rates: { CRYSTA: 2500, INNOVA: 2300, ERTIGA: 2100, TAVERA: 2100, ETIOS: 2100, SWIFT: 2000, ECCO: 1800, ALTO: 1700, SUMO: , BOLERO: 0 }
  },
  {
    place: "MARKET DROP",
    rates: { CRYSTA: 1200, INNOVA: 1000, ERTIGA: 900, TAVERA: 800, ETIOS: 900, SWIFT: 800, ECCO: 800, ALTO: 700, SUMO: , BOLERO: 0 }
  },
  {
    place: "MARKET RETURN",
    rates: { CRYSTA: 1800, INNOVA: 1600, ERTIGA: 1500, TAVERA: 1500, ETIOS: 1500, SWIFT: 1400, ECCO: 1400, ALTO: 1300, SUMO: , BOLERO: 0 }
  },
  {
    place: "KHANABAL RAILWAY DROP",
    rates: { CRYSTA: 2100, INNOVA: 1900, ERTIGA: 1600, TAVERA: 1700, ETIOS: 1600, SWIFT: 1500, ECCO: 1500, ALTO: 1400, SUMO: , BOLERO: 0 }
  },
  {
    place: "SINTHAN PASS VIA ACHABAL",
    rates: { CRYSTA: 6500, INNOVA: 6300, ERTIGA: 5700, TAVERA: 6000, ETIOS: 5700, SWIFT: 5600, ECCO: 5500, ALTO: 5300, SUMO: , BOLERO: 0 }
  },
  {
    place: "ACHABAL KOKERNAG MATTAN",
    rates: { CRYSTA: 4200, INNOVA: 4000, ERTIGA: 3200, TAVERA: 3500, ETIOS: 3200, SWIFT: 3100, ECCO: 3000, ALTO: 2800, SUMO: , BOLERO: 0 }
  },
  {
    place: "SUN TEMPLE MATTAN TEMPLE",
    rates: { CRYSTA: 2700, INNOVA: 2500, ERTIGA: 1900, TAVERA: 2200, ETIOS: 1900, SWIFT: 1800, ECCO: 1700, ALTO: 1700, SUMO: , BOLERO: 0 }
  },
  {
    place: "SRINAGAR TRC DROP",
    rates: { CRYSTA: 4100, INNOVA: 3900, ERTIGA: 3650, TAVERA: 3600, ETIOS: 3650, SWIFT: 3550, ECCO: 3500, ALTO: 3300, SUMO: , BOLERO: 0 }
  },
  {
    place: "AIRPORT DROP",
    rates: { CRYSTA: 4300, INNOVA: 4100, ERTIGA: 3650, TAVERA: 3700, ETIOS: 3650, SWIFT: 3550, ECCO: 3400, ALTO: 3300, SUMO: , BOLERO: 0 }
  },
  {
    place: "GULMARG DROP",
    rates: { CRYSTA: 6100, INNOVA: 5900, ERTIGA: 5500, TAVERA: 5500, ETIOS: 5500, SWIFT: 5400, ECCO: 5300, ALTO: 5200, SUMO: , BOLERO: 0 }
  },
  {
    place: "JAMMU DROP",
    rates: { CRYSTA: 10500, INNOVA: 10300, ERTIGA: 9100, TAVERA: 9500, ETIOS: 9100, SWIFT: 9000, ECCO: 8800, ALTO: 8500, SUMO: , BOLERO: 0 }
  },
  {
    place: "KATRA DROP",
    rates: { CRYSTA: 11000, INNOVA: 10800, ERTIGA: 9100, TAVERA: 10000, ETIOS: 9100, SWIFT: 9000, ECCO: 8600, ALTO: 8400, SUMO: , BOLERO: 0 }
  },
  {
    place: "JAMMU VIA PATNITOP NIGHT",
    rates: { CRYSTA: 13000, INNOVA: 12800, ERTIGA: 10600, TAVERA: 11000, ETIOS: 10600, SWIFT: 10500, ECCO: 10300, ALTO: 10100, SUMO: , BOLERO: 0 }
  },
  {
    place: "SONAMARG DROP",
    rates: { CRYSTA: 7100, INNOVA: 6900, ERTIGA: 6500, TAVERA: 6500, ETIOS: 6500, SWIFT: 6400, ECCO: 6200, ALTO: 6000, SUMO: , BOLERO: 0 }
  },
  {
    place: "DARGAH",
    rates: { CRYSTA: 1800, INNOVA: 1600, ERTIGA: 1300, TAVERA: 1500, ETIOS: 1300, SWIFT: 1200, ECCO: 1100, ALTO: 1000, SUMO: , BOLERO: 0 }
  },
  {
    place: "AHARBAL",
    rates: { CRYSTA: 5200, INNOVA: 5000, ERTIGA: 4300, TAVERA: 4500, ETIOS: 4300, SWIFT: 4200, ECCO: 4100, ALTO: 3900, SUMO: , BOLERO: 0 }
  },
  {
    place: "VERINAG",
    rates: { CRYSTA: 5000, INNOVA: 4800, ERTIGA: 4300, TAVERA: 4600, ETIOS: 4300, SWIFT: 4200, ECCO: 4100, ALTO: 4000, SUMO: , BOLERO: 0 }
  },
  {
    place: "MAHARAJA PALACE",
    rates: { CRYSTA: 1200, INNOVA: 1000, ERTIGA: 800, TAVERA: 800, ETIOS: 0, SWIFT: 700, ECCO: 700, ALTO: 700, SUMO: , BOLERO: 0 }
  },
  {
    place: "LEH DROP",
    rates: { CRYSTA: 27200, INNOVA: 27000, ERTIGA: 24500, TAVERA: 22500, ETIOS: 0, SWIFT: 18500, ECCO: 0, ALTO: 0, SUMO: , BOLERO: 0 }
  },
  {
    place: "MAMALESHWAR S.P. GAURI SHANKER",
    rates: { CRYSTA: 2500, INNOVA: 2300, ERTIGA: 2100, TAVERA: 1900, ETIOS: 1800, SWIFT: 1700, ECCO: 1600, ALTO: 1500, SUMO: , BOLERO: 0 }
  }
];

export async function GET() {
  try {
    const existing = await prisma.taxiRateCard.count();
    if (existing > 0) {
      await prisma.taxiRateCard.deleteMany();
    }

    for (const rate of TAXI_RATES) {
      await prisma.taxiRateCard.create({
        data: {
          place: rate.place,
          rates: rate.rates as any,
        }
      });
    }

    return NextResponse.json({ success: true, seeded: TAXI_RATES.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed rate cards" }, { status: 500 });
  }
}
