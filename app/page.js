import { fetchSheet } from "../lib/sheets";
import { fetch510k, fetchRecalls } from "../lib/openfda";
import Explorer from "./Explorer";

export const dynamic = "force-dynamic"; // always fetch fresh data, no caching

export default async function Page() {
  const [
    newHireNA,
    newHireEU,
    jobsNA,
    jobsEU,
    jobsAuto,
    promoNA,
    promoEU,
    promoAuto,
    fda510k,
    fdaRecalls,
  ] = await Promise.all([
    fetchSheet("New Hire: MD-NA"),
    fetchSheet("New Hire: MD-EU"),
    fetchSheet("Jobs: MD-NA"),
    fetchSheet("Jobs: MD-EU"),
    fetchSheet("Jobs: Automotive"),
    fetchSheet("Promo: MD-NA"),
    fetchSheet("Promo: MD-EU"),
    fetchSheet("Promo: Automotive"),
    fetch510k(),
    fetchRecalls(),
  ]);

  const data = {
    generatedAt: new Date().toISOString(),
    newHireNA,
    newHireEU,
    jobsNA,
    jobsEU,
    jobsAuto,
    promoNA,
    promoEU,
    promoAuto,
    fda510k,
    fdaRecalls,
  };

  return <Explorer data={data} />;
}
