import React from "react";
import { ScrollView } from "react-native";
import NDIndexTrend, { IndexTrend } from "../components/NDIndexTrend";

const sampleData: IndexTrend[] = [
  { name: "Nikkei 225", exchange: "Tokyo", value: 32000, change: 0.5 },
  { name: "Dow Jones", exchange: "NYSE", value: 34000, change: -0.3 },
  { name: "Nasdaq Composite", exchange: "NASDAQ", value: 13000, change: 1.2 },
];

const NDIndexTrendScreen: React.FC = () => {
  return (
    <ScrollView>
      {sampleData.map((idx) => (
        <NDIndexTrend key={idx.name} data={idx} />
      ))}
    </ScrollView>
  );
};

export default NDIndexTrendScreen;
