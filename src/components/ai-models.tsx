import { useState, useEffect } from "react";
import { AIService } from "@/services/ai-service";
import { AIModel } from "@/types/ai";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export const AIModels = () => {
  const { theme } = useTheme();
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedModels = await AIService.listModels();
      setModels(loadedModels);
      setSelectedModel(AIService.getCurrentModel());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load models";
      setError(errorMessage);
      console.error("Error loading models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectModel = (model: string) => {
    AIService.setModel(model);
    setSelectedModel(model);
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`font-medium ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Available AI Models
        </h3>
        <button
          //   variant="outline"
          //   size="sm"
          onClick={loadModels}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          className={`p-3 mb-4 rounded-md ${
            isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
          }`}
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        {models.map((model) => (
          <div
            key={model.name}
            className={`p-3 rounded-md cursor-pointer transition-colors ${
              selectedModel === model.name
                ? isDark
                  ? "bg-blue-900 text-white"
                  : "bg-blue-100 text-blue-800"
                : isDark
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => handleSelectModel(model.name)}
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-xs opacity-75">
              {Math.round(model.size / 1000000000)}GB •{" "}
              {new Date(model.modified_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
