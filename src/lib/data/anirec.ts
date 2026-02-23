import type { Product } from "./index";

export const anirec: Product = {
  id: "anirec",
  name: "アニリク",
  taskCount: 1,
  description: "アニメPV制作の業務マニュアル",
  hasOverallManual: true,
  hasOverallFlow: false,
  issues: [],
  tasks: [
    {
      no: "0",
      category: "マニュアル",
      name: "全体マニュアル",
      assignee: "-",
      nextAssignee: "-",
      tools: "GAS, Gemini, Kling AI, SUNO, FISH AUDIO",
      deliverable: "-",
      checkpoint: "-",
      hasManual: true,
      issues: "",
    },
  ],
};
