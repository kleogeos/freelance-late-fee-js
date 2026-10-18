#!/usr/bin/env node
"use strict";

const STAGES = [
  [0, 0, "not_due", "Invoice not yet overdue."],
  [1, 7, "friendly", "Friendly reminder — assume an oversight."],
  [8, 21, "firm", "Firm follow-up — ask for a specific payment date."],
  [22, 45, "notice", "Notice of late fee — restate amount owed including the fee."],
  [46, null, "final", "Final notice — state next step (pause work / collections)."],
];

function parseDate(s, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    console.error(`Invalid ${label} date '${s}', expected YYYY-MM-DD.`);
    process.exit(1);
  }
  const d = new Date(s + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) {
    console.error(`Invalid ${label} date '${s}', expected YYYY-MM-DD.`);
    process.exit(1);
  }
  return d;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function stageFor(daysOverdue) {
  for (const [lo, hi, key, desc] of STAGES) {
    if (hi === null) {
      if (daysOverdue >= lo) return [key, desc];
    } else if (lo <= daysOverdue && daysOverdue <= hi) {
      return [key, desc];
    }
  }
  return ["not_due", STAGES[0][3]];
}

function fmtRate(rate) {
  // mirrors Python's {rate:g} -- drop trailing zeros / unnecessary decimals
  return String(parseFloat(rate.toPrecision(12)));
}

function cmdCompute(args) {
  const due = parseDate(args.dueDate, "--due-date");
  const today = args.today ? parseDate(args.today, "--today") : new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");

  if (today.getTime() < due.getTime()) {
    console.error(`Not yet due: due ${isoDate(due)}, today ${isoDate(today)}.`);
    process.exit(1);
  }

  const rawOverdue = Math.round((today.getTime() - due.getTime()) / 86400000);
  const daysOverdue = Math.max(0, rawOverdue - args.graceDays);
  const fee = daysOverdue <= 0 ? 0.0 : Math.round(args.amount * (args.rate / 100.0) * (daysOverdue / 30.0) * 100) / 100;
  const total = Math.round((args.amount + fee) * 100) / 100;
  const [stageKey, stageDesc] = stageFor(daysOverdue);

  if (args.json) {
    // Python's argparse type=float always yields a float (so whole numbers
    // still serialize as "500.0", "2.0") -- replicate that explicitly since
    // JSON.stringify collapses 500.0 to 500.
    const asFloat = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
    const amount = Math.round(args.amount * 100) / 100;
    const parts = [
      `"invoice_amount": ${asFloat(amount)}`,
      `"due_date": "${isoDate(due)}"`,
      `"today": "${isoDate(today)}"`,
      `"days_overdue": ${daysOverdue}`,
      `"late_fee_rate_pct_per_month": ${asFloat(args.rate)}`,
      `"grace_days": ${args.graceDays}`,
      `"late_fee": ${asFloat(fee)}`,
      `"total_due": ${asFloat(total)}`,
      `"stage": "${stageKey}"`,
    ];
    console.log(`{${parts.join(", ")}}`);
    return;
  }

  console.log(`Invoice amount:   ${args.amount.toFixed(2)}`);
  console.log(`Due date:         ${isoDate(due)}`);
  console.log(`Today:             ${isoDate(today)}`);
  console.log(`Days overdue:      ${daysOverdue} (after ${args.graceDays}-day grace period)`);
  console.log(`Late fee (${fmtRate(args.rate)}%/mo): ${fee.toFixed(2)}`);
  console.log(`Total due:         ${total.toFixed(2)}`);
  console.log(`Stage:             ${stageKey} — ${stageDesc}`);
  if (stageKey !== "not_due") {
    console.log("");
    console.log("Need the actual email copy for this stage? The free Starter Kit excerpt has all 4:");
    console.log("https://gist.github.com/kleogeos/845669cc43509b012a0ac2aecac00d0a");
  }
}

function cmdStages() {
  console.log(`${"days overdue".padStart(14)}  ${"stage".padEnd(10)}  description`);
  for (const [lo, hi, key, desc] of STAGES) {
    const rng = hi === null ? `${lo}+` : `${lo}-${hi}`;
    console.log(`${rng.padStart(14)}  ${key.padEnd(10)}  ${desc}`);
  }
}

function printHelp() {
  console.log(`freelance-late-fee-js - compute late fee + reminder stage for an overdue invoice

Usage:
  freelance-latefee compute <amount> --due-date YYYY-MM-DD [--today DATE] [--rate PCT] [--grace-days N] [--json]
  freelance-latefee stages

Run without installing:
  npx github:kleogeos/freelance-late-fee-js compute 1000 --due-date 2026-09-01 --today 2026-10-17
`);
}

function parseArgs(argv) {
  const out = { amount: null, dueDate: null, today: null, rate: 1.5, graceDays: 0, json: false };
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--due-date") out.dueDate = argv[++i];
    else if (a === "--today") out.today = argv[++i];
    else if (a === "--rate") out.rate = Number(argv[++i]);
    else if (a === "--grace-days") out.graceDays = Number(argv[++i]);
    else if (a === "--json") out.json = true;
    else positionals.push(a);
  }
  if (positionals.length) out.amount = Number(positionals[0]);
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  if (command === "stages") {
    cmdStages();
    return;
  }

  if (command === "compute") {
    const args = parseArgs(argv.slice(1));
    if (args.amount === null || !args.dueDate) {
      printHelp();
      process.exit(1);
    }
    cmdCompute(args);
    return;
  }

  printHelp();
  process.exit(1);
}

module.exports = { stageFor, STAGES };

if (require.main === module) {
  main();
}
