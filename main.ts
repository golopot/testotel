import {
    diag,
    DiagConsoleLogger,
    DiagLogLevel,
    trace,
} from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
    BatchSpanProcessor,
    ConsoleSpanExporter,
    SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

export const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: process.env.DEVOPS_SERVICE_NAME,
        "deployment.environment": process.env.APP_ENV,
    }),
    spanProcessors: [
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
        new BatchSpanProcessor(
            new OTLPTraceExporter({
                url: "https://apm.chiawen.dev/v1/traces",
            })
        ),
    ],
    logRecordProcessors: [],
    instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const tracer = trace.getTracer("my-app");

async function main() {
    await tracer.startActiveSpan("span1", async (span) => {
        span.end();
    });

    await sdk.shutdown();
}

main().catch(console.error);
