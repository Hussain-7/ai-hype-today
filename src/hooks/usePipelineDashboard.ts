import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

interface PipelineJob {
	id: string;
	status: JobStatus;
	totalCompanies: number;
	processedCompanies: number;
	successfulCompanies: number;
	failedCompanies: number;
	totalArticlesFound: number;
	totalArticlesSaved: number;
	duplicatesSkipped: number;
	startedAt: string | null;
	completedAt: string | null;
	createdAt: string;
}

interface Article {
	id: string;
	title: string;
	description: string | null;
	url: string;
	publishedAt: string;
	company: {
		name: string;
		slug: string;
		dominanceBucket: string;
	};
}

interface JobStatusResponse {
	jobId: string;
	status: JobStatus;
	progress: {
		totalCompanies: number;
		processedCompanies: number;
		successfulCompanies: number;
		failedCompanies: number;
	};
	articles: {
		found: number;
		saved: number;
		duplicatesSkipped: number;
	};
	timing: {
		startedAt: string | null;
		completedAt: string | null;
	};
}

export function usePipelineDashboard() {
	const queryClient = useQueryClient();

	// Fetch recent jobs with automatic refetching if there's a running job
	const { data: jobsData } = useQuery({
		queryKey: ["jobs"],
		queryFn: async () => {
			const res = await fetch("/api/jobs?limit=5");
			if (!res.ok) {
				throw new Error(`Failed to fetch jobs: ${res.status}`);
			}
			const data = await res.json();
			return { jobs: (data.jobs || []) as PipelineJob[] };
		},
		refetchInterval: (query) => {
			const jobs = query.state.data?.jobs || [];
			const hasRunningJob = jobs.some(
				(job) => job.status === "PENDING" || job.status === "RUNNING",
			);
			return hasRunningJob ? 2000 : false; // Poll every 2s if job is running
		},
	});

	// Fetch recent articles
	const { data: articlesData } = useQuery({
		queryKey: ["articles"],
		queryFn: async () => {
			const res = await fetch("/api/articles?limit=20");
			if (!res.ok) {
				throw new Error(`Failed to fetch articles: ${res.status}`);
			}
			const data = await res.json();
			return { articles: (data.articles || []) as Article[] };
		},
	});

	// Find current running job
	const currentJob = useMemo(() => {
		const jobs = jobsData?.jobs || [];
		return jobs.find(
			(job) => job.status === "PENDING" || job.status === "RUNNING",
		);
	}, [jobsData]);

	// Fetch current job status if there's a running job
	const { data: jobStatusData } = useQuery<JobStatusResponse | null>({
		queryKey: ["jobStatus", currentJob?.id],
		queryFn: async () => {
			if (!currentJob?.id) return null;
			const res = await fetch(`/api/pipeline/status/${currentJob.id}`);
			if (!res.ok) throw new Error("Failed to fetch job status");
			return res.json();
		},
		enabled: !!currentJob?.id,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			if (status === "COMPLETED" || status === "FAILED") {
				// Invalidate jobs and articles when job completes
				queryClient.invalidateQueries({ queryKey: ["jobs"] });
				queryClient.invalidateQueries({ queryKey: ["articles"] });
				return false;
			}
			return 2000; // Poll every 2s while running
		},
	});

	// Trigger pipeline mutation
	const triggerPipelineMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/pipeline/trigger", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ triggeredBy: "dashboard" }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to trigger pipeline");
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
		},
	});

	// Transform job status data for display
	const currentJobDisplay = useMemo(() => {
		if (!jobStatusData) return currentJob;
		return {
			id: jobStatusData.jobId,
			status: jobStatusData.status,
			totalCompanies: jobStatusData.progress.totalCompanies,
			processedCompanies: jobStatusData.progress.processedCompanies,
			successfulCompanies: jobStatusData.progress.successfulCompanies,
			failedCompanies: jobStatusData.progress.failedCompanies,
			totalArticlesFound: jobStatusData.articles.found,
			totalArticlesSaved: jobStatusData.articles.saved,
			duplicatesSkipped: jobStatusData.articles.duplicatesSkipped,
			startedAt: jobStatusData.timing.startedAt,
			completedAt: jobStatusData.timing.completedAt,
			createdAt: "",
		};
	}, [jobStatusData, currentJob]);

	const recentJobs = jobsData?.jobs || [];
	const recentArticles = articlesData?.articles || [];
	const error = triggerPipelineMutation.error
		? triggerPipelineMutation.error instanceof Error
			? triggerPipelineMutation.error.message
			: "An error occurred"
		: null;

	return {
		recentJobs,
		recentArticles,
		currentJobDisplay,
		triggerPipeline: triggerPipelineMutation.mutate,
		isPipelineTriggering: triggerPipelineMutation.isPending,
		error,
	};
}

export type { Article, JobStatus, PipelineJob };
