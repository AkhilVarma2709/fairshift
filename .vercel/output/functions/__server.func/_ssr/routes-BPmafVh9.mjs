import { r as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useDashboardData } from "./dashboard-context-DP2qLhQ0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { n as Sparkles, r as CircleCheck, t as Upload } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BPmafVh9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
var DAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
var SHIFT_LABELS = [
	"Off",
	"Morning",
	"Day",
	"Night"
];
function HomePage() {
	const { analysisSummary, baselineEmployees, beforeAfter, currentDataset, employees, hasDataset, hasOptimized, loading, optimize, optimizing, solverSummary, upload } = useDashboardData();
	const [employeesFile, setEmployeesFile] = (0, import_react.useState)(null);
	const [historyFile, setHistoryFile] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [uploadProgress, setUploadProgress] = (0, import_react.useState)(0);
	const [fairnessWeight, setFairnessWeight] = (0, import_react.useState)([65]);
	const [minWorkDays, setMinWorkDays] = (0, import_react.useState)([2]);
	const [maxWorkDays, setMaxWorkDays] = (0, import_react.useState)([5]);
	const currentRiskCount = (0, import_react.useMemo)(() => employees.filter((employee) => employee.riskScore >= 55).length, [employees]);
	const currentCriticalCount = (0, import_react.useMemo)(() => employees.filter((employee) => employee.riskScore >= 75).length, [employees]);
	const baselineMap = (0, import_react.useMemo)(() => new Map(baselineEmployees.map((employee) => [employee.id, employee])), [baselineEmployees]);
	const dataPreview = (0, import_react.useMemo)(() => baselineEmployees, [baselineEmployees]);
	const scheduleRows = (0, import_react.useMemo)(() => hasOptimized ? employees : baselineEmployees, [
		baselineEmployees,
		employees,
		hasOptimized
	]);
	const uploadDataset = async () => {
		if (!employeesFile || !historyFile) {
			toast.error("Upload both employees.csv and shift_history.csv.");
			return;
		}
		setUploading(true);
		setUploadProgress(0);
		try {
			const result = await upload({
				employeesFile,
				historyFile
			}, setUploadProgress);
			const imported = [result.rows.employees ? `${result.rows.employees} employee rows` : null, result.rows.shiftHistory ? `${result.rows.shiftHistory} shift rows` : null].filter(Boolean).join(" · ");
			toast.success(imported || "Dataset uploaded");
			setEmployeesFile(null);
			setHistoryFile(null);
			setUploadProgress(100);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};
	const runOptimization = async () => {
		const notice = toast.loading("Creating next week's schedule...");
		try {
			const result = await optimize(fairnessWeight[0], minWorkDays[0], maxWorkDays[0]);
			toast.success(`Schedule ready in ${(result.tookMs / 1e3).toFixed(2)}s`, {
				id: notice,
				description: `Fairness ${result.fairness}% · Morale ${result.morale}% · ${minWorkDays[0]}-${maxWorkDays[0]} days`
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Optimization failed", { id: notice });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-8 md:py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-6 shadow-[var(--shadow-elevated)] md:p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-primary",
							children: "FairShift"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "rounded-full px-3 py-1",
							children: "One page scheduler"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground",
								children: "Fairness-first workforce planning"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 max-w-4xl font-display text-4xl leading-[0.95] md:text-6xl",
								children: "Upload the shift files, inspect the data, and generate a fairer week."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base",
								children: "Keep only the essentials: load `employees.csv` and `shift_history.csv`, compare the fairness metrics before and after optimization, and review the next-week schedule in one place."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Employees loaded",
									value: hasDataset ? String(baselineEmployees.length) : "Waiting"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Current fairness",
									value: hasDataset ? `${formatNumber(beforeAfter.before.fairness)}%` : "--"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									label: "Working-day rule",
									value: hasDataset ? `${solverSummary.minWorkDays ?? minWorkDays[0]}-${solverSummary.maxWorkDays ?? maxWorkDays[0]} days` : `${minWorkDays[0]}-${maxWorkDays[0]} days`
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-[1.1fr_0.9fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						title: "1. Upload files",
						description: "Choose one or both CSV files and make them the active dataset for analysis.",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileField, {
								id: "employeesFile",
								label: "Employees CSV",
								file: employeesFile,
								onChange: setEmployeesFile
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileField, {
								id: "historyFile",
								label: "Shift history CSV",
								file: historyFile,
								onChange: setHistoryFile
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-[1.35rem] border border-dashed border-border bg-background/80 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Uploaded files"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: currentDataset ? `${currentDataset.employeesFilename} · ${currentDataset.shiftHistoryFilename}` : "No files uploaded yet."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "rounded-full px-5",
										onClick: () => void uploadDataset(),
										disabled: uploading || !employeesFile || !historyFile,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 h-4 w-4" }), uploading ? "Uploading..." : "Upload"]
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: uploadProgress })
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "2. Optimizer settings",
						description: "Set how strongly the optimizer should prioritize fairness and the weekly working-day range.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConstraintCard, {
									label: "Fairness weight",
									value: `${fairnessWeight[0]}%`,
									hint: "Higher values push the solver harder toward reducing overload and stress.",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										value: fairnessWeight,
										onValueChange: setFairnessWeight,
										min: 30,
										max: 90,
										step: 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lower fairness focus" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Higher fairness focus" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConstraintCard, {
									label: "Minimum working days",
									value: `${minWorkDays[0]} days`,
									hint: "Guarantee at least this many working days per employee in the generated week.",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										value: minWorkDays,
										onValueChange: (value) => {
											const nextMin = value[0];
											setMinWorkDays([nextMin]);
											if (nextMin > maxWorkDays[0]) setMaxWorkDays([nextMin]);
										},
										min: 0,
										max: 5,
										step: 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0 days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "5 days" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConstraintCard, {
									label: "Maximum working days",
									value: `${maxWorkDays[0]} days`,
									hint: "Keep any employee from being scheduled above this weekly cap.",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										value: maxWorkDays,
										onValueChange: (value) => {
											const nextMax = value[0];
											setMaxWorkDays([nextMax]);
											if (nextMax < minWorkDays[0]) setMinWorkDays([nextMax]);
										},
										min: 2,
										max: 7,
										step: 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2 days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "7 days" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "h-12 w-full rounded-full text-base",
									onClick: () => void runOptimization(),
									disabled: optimizing || loading || !hasDataset,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), optimizing ? "Generating schedule..." : "Generate next week's schedule"]
								})
							]
						})
					})]
				}),
				hasDataset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "3. Uploaded data",
						description: "The raw employee data loaded from the uploaded files is shown below.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTable, { employees: dataPreview })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						title: "4. Before vs after",
						description: "Use this comparison to see the fairness, burden, morale, and risk differences created by the optimizer.",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareCard, {
										label: "Fairness",
										before: beforeAfter.before.fairness,
										after: beforeAfter.after.fairness,
										betterWhen: "higher",
										unit: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareCard, {
										label: "Average Burden",
										before: beforeAfter.before.burden,
										after: beforeAfter.after.burden,
										betterWhen: "lower",
										unit: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareCard, {
										label: "Morale",
										before: beforeAfter.before.morale,
										after: beforeAfter.after.morale,
										betterWhen: "higher",
										unit: "%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompareCard, {
										label: "At-Risk Employees",
										before: analysisSummary.flagged,
										after: currentRiskCount,
										betterWhen: "lower"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-4 md:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallCompare, {
									label: "Critical Risk",
									before: analysisSummary.critical,
									after: currentCriticalCount,
									betterWhen: "lower"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallCompare, {
									label: "Fairness Gap",
									before: analysisSummary.fairnessGap,
									after: Math.max(0, 100 - beforeAfter.after.fairness),
									betterWhen: "lower",
									unit: "%"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 rounded-[1.35rem] border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground",
								children: hasOptimized ? "Difference view is showing the optimized result." : "Run the optimizer to replace the baseline with a fairer next-week schedule."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						title: "5. Next week's schedule",
						description: hasOptimized ? "This is the optimized next-week schedule." : "Upload the files and run the optimizer to generate the next week's schedule.",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendPill, {
										label: "Off",
										className: "bg-muted text-muted-foreground"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendPill, {
										label: "Morning",
										className: "bg-primary-soft text-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendPill, {
										label: "Day",
										className: "bg-success/12 text-success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegendPill, {
										label: "Night",
										className: "bg-warning/15 text-warning"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduleTable, {
								employees: scheduleRows,
								baselineMap,
								showDelta: hasOptimized
							}),
							hasOptimized ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-2 rounded-[1rem] border border-success/25 bg-success/8 px-4 py-3 text-sm text-success",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }),
									"Updated schedule generated with fairness weight ",
									solverSummary.fairnessWeight,
									"% and working-day range ",
									solverSummary.minWorkDays ?? minWorkDays[0],
									" to ",
									solverSummary.maxWorkDays ?? maxWorkDays[0],
									"."
								]
							}) : null
						]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "3. Upload to continue",
					description: "Once both CSV files are uploaded, this page will show the employee table, fairness comparison, and the generated next-week schedule.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-[1.35rem] border border-dashed border-border bg-background/80 px-4 py-10 text-center text-sm text-muted-foreground",
						children: "Upload `employees.csv` and `shift_history.csv` to unlock the shift analysis."
					})
				})
			]
		})
	});
}
function Panel({ title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[1.75rem] border border-border/80 bg-card/90 p-5 shadow-[var(--shadow-soft)] md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl leading-tight",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted-foreground",
				children: description
			})]
		}), children]
	});
}
function StatCard({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[1.35rem] border border-border/90 bg-background/85 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-lg font-semibold text-foreground",
			children: value
		})]
	});
}
function ConstraintCard({ label, value, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[1.25rem] border border-border bg-background/80 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground",
				children: value
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 px-1",
			children
		})]
	});
}
function FileField({ id, label, file, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		htmlFor: id,
		className: "block rounded-[1.25rem] border border-border bg-background/80 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "CSV only."
			})] }), file ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "rounded-full",
				children: file.name
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id,
			type: "file",
			accept: ".csv",
			className: "mt-4 rounded-xl bg-card",
			onChange: (event) => onChange(event.target.files?.[0] ?? null)
		})]
	});
}
function PreviewTable({ employees }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-[1.25rem] border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[30rem] overflow-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "min-w-full text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/70 text-xs uppercase tracking-[0.18em] text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Role"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Team"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Burden"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Risk"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: employees.map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border bg-card/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-medium",
							children: employee.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: employee.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: employee.team
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [employee.burden, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: employee.riskScore
						})
					]
				}, employee.id)) })]
			})
		})
	});
}
function CompareCard({ label, before, after, betterWhen, unit = "" }) {
	const diff = after - before;
	const improved = betterWhen === "higher" ? diff >= 0 : diff <= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-[1.25rem] border p-4", improved ? "border-success/30 bg-success/8" : "border-warning/30 bg-warning/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.18em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-3 gap-3 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricBlock, {
					label: "Before",
					value: `${formatNumber(before)}${unit}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricBlock, {
					label: "After",
					value: `${formatNumber(after)}${unit}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricBlock, {
					label: "Difference",
					value: `${diff > 0 ? "+" : ""}${formatNumber(diff)}${unit}`,
					accent: improved ? "text-success" : "text-warning"
				})
			]
		})]
	});
}
function SmallCompare({ label, before, after, betterWhen, unit = "" }) {
	const diff = after - before;
	const improved = betterWhen === "higher" ? diff >= 0 : diff <= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-[1.25rem] border border-border bg-background/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					"Before ",
					formatNumber(before),
					unit,
					" · After ",
					formatNumber(after),
					unit
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("text-sm font-semibold", improved ? "text-success" : "text-warning"),
				children: [
					diff > 0 ? "+" : "",
					formatNumber(diff),
					unit
				]
			})]
		})
	});
}
function MetricBlock({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("mt-1 text-lg font-semibold text-foreground", accent),
		children: value
	})] });
}
function ScheduleTable({ baselineMap, employees, showDelta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-[1.25rem] border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[42rem] overflow-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "min-w-full text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-secondary/70 text-xs uppercase tracking-[0.18em] text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Before / After"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Next Week"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: employees.map((employee) => {
					const baseline = baselineMap.get(employee.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border bg-card/80 align-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: employee.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										employee.role,
										" · ",
										employee.team
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-medium",
										children: [
											baseline?.burden ?? employee.burden,
											"% burden ",
											"->",
											" ",
											employee.burden,
											"% burden"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											baseline?.riskScore ?? employee.riskScore,
											" risk ",
											"->",
											" ",
											employee.riskScore,
											" risk"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											baseline?.shifts.filter((shift) => shift !== 0).length ?? employee.shifts.filter((shift) => shift !== 0).length,
											" working days ",
											"->",
											" ",
											employee.shifts.filter((shift) => shift !== 0).length,
											" working days"
										]
									}),
									showDelta && baseline ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-success",
										children: [(baseline.burden - employee.burden).toFixed(1), " burden points lower"]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: employee.shifts.map((shift, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("min-w-20 rounded-xl px-3 py-2 text-center text-xs font-medium", shift === 0 && "bg-muted text-muted-foreground", shift === 1 && "bg-primary-soft text-primary", shift === 2 && "bg-success/12 text-success", shift === 3 && "bg-warning/15 text-warning"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: DAYS[index] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1",
											children: SHIFT_LABELS[shift]
										})]
									}, `${employee.id}-${DAYS[index]}`))
								})
							})
						]
					}, employee.id);
				}) })]
			})
		})
	});
}
function LegendPill({ label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-full px-3 py-1 text-xs font-semibold", className),
		children: label
	});
}
function formatNumber(value) {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
//#endregion
export { HomePage as component };
