from sklearn.cluster import KMeans
import numpy as np

class ClusteringService:
       def cluster(self, embeddings: list[list[float]], n_clusters: int = 5) -> dict:
        if not embeddings: return {}
        
        # Adjust clusters if we have very few results
        num_samples = len(embeddings)
        actual_clusters = min(n_clusters, num_samples)
        
        if actual_clusters < 2:
            return {"Main Trend": "General topics related to your search"}

        data = np.array(embeddings)
        kmeans = KMeans(n_clusters=actual_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(data)
        
        result = {}
        for i in range(actual_clusters):
            count = list(labels).count(i)
            result[f"Trend Theme {i+1}"] = f"Group of {count} related videos and discussions"
            
        return result