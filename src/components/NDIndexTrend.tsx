import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type IndexTrend = {
  name: string;
  exchange: string;
  value: number;
  change: number; // percentage change
};

type Props = {
  data: IndexTrend;
};

const NDIndexTrend: React.FC<Props> = ({ data }) => {
  const changeColor = data.change >= 0 ? "#16a34a" : "#f43f5e";

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.exchange}>{data.exchange}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{data.value.toFixed(2)}</Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {data.change >= 0 ? "+" : ""}
          {data.change.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

export default NDIndexTrend;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  exchange: {
    fontSize: 12,
    color: "#666",
  },
  value: {
    fontSize: 16,
  },
  change: {
    fontSize: 16,
  },
});
