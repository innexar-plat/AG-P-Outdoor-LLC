"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  body?: Record<string, string>;
  query?: Record<string, string>;
  response: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

interface ApiDocsViewProps {
  sections: ApiSection[];
  baseUrl: string;
  version: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 border-emerald-200",
  POST: "bg-blue-100 text-blue-700 border-blue-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  PATCH: "bg-purple-100 text-purple-700 border-purple-200",
};

export function ApiDocsView({ sections, baseUrl, version }: ApiDocsViewProps) {
  const { t } = useI18n();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Documentation"
        description={`Base URL: ${baseUrl} · v${version}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-3 space-y-0.5">
              {sections.map((section, idx) => (
                <button
                  key={section.title}
                  onClick={() => setExpandedSection(idx)}
                  className={`
                    w-full text-left rounded-lg px-3 py-2 text-sm transition-colors
                    ${expandedSection === idx
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                    }
                  `.trim()}
                >
                  {section.title}
                  <span className="ml-1 text-xs text-slate-400">({section.endpoints.length})</span>
                </button>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {expandedSection !== null && sections[expandedSection] && (
            <>
              <Card>
                <CardBody>
                  <h2 className="text-lg font-bold text-slate-900">{sections[expandedSection].title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{sections[expandedSection].description}</p>
                </CardBody>
              </Card>

              {sections[expandedSection].endpoints.map((ep) => {
                const key = `${ep.method}-${ep.path}`;
                const isExpanded = expandedEndpoint === key;
                return (
                  <Card key={key}>
                    <button
                      onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                      className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors rounded-xl"
                    >
                      <span className={`text-xs font-bold px-2.5 py-1 rounded border ${METHOD_COLORS[ep.method] ?? "bg-gray-100 text-gray-700"}`}>
                        {ep.method}
                      </span>
                      <code className="text-sm font-mono text-slate-800 flex-1">{ep.path}</code>
                      {ep.auth && <Badge variant="warning">Auth</Badge>}
                      <svg
                        className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <CardBody className="border-t border-surface-border space-y-4">
                        <p className="text-sm text-slate-600">{ep.description}</p>

                        {ep.body && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Request Body</p>
                            <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs space-y-1">
                              {Object.entries(ep.body).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-brand-600 shrink-0">{k}:</span>
                                  <span className="text-slate-600">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ep.query && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Query Parameters</p>
                            <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs space-y-1">
                              {Object.entries(ep.query).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-brand-600 shrink-0">{k}:</span>
                                  <span className="text-slate-600">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Response</p>
                          <code className="block bg-slate-900 text-green-400 rounded-lg p-3 text-xs font-mono">
                            {ep.response}
                          </code>
                        </div>
                      </CardBody>
                    )}
                  </Card>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
