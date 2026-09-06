import time
from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self, name: str, agent_id: str):
        self.name = name
        self.agent_id = agent_id

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        result_data = self.run(state)
        elapsed = time.time() - start_time
        
        step_trace = {
            "agentName": self.name,
            "agentId": self.agent_id,
            "task": result_data.get("description", f"Processing {self.name}"),
            "status": "complete",
            "description": result_data.get("description", f"{self.name} finished processing."),
            "duration": round(elapsed, 2),
            "executionTime": f"{round(elapsed, 2)}s",
            "result": result_data.get("summary", ""),
            "outputSummary": result_data.get("summary", ""),
            "data": result_data.get("output", {})
        }
        
        if "agent_trace" not in state:
            state["agent_trace"] = []
        state["agent_trace"].append(step_trace)
        
        return result_data

    @abstractmethod
    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        pass
