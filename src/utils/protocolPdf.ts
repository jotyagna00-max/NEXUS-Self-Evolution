/**
 * protocolPdf.ts — Generates downloadable PDF guides for store protocols and books.
 *
 * Uses jsPDF to create a formatted, multi-page PDF with the protocol's
 * training guide, schedule, form cues, and progression rules.
 */

import { jsPDF } from 'jspdf';
import { getStoreContent } from './storeContent';
import type { StoreItem } from '../types';

const PAGE_WIDTH = 210; // A4 mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;

interface PdfSection {
  heading: string;
  body: string;
}

/**
 * Generate and download a PDF guide for a store item.
 */
export function generateProtocolPdf(item: StoreItem): void {
  const content = getStoreContent(item.id);
  if (!content) {
    generateSimplePdf(item);
    return;
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  // ─── Title block ───
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, PAGE_WIDTH, 40, 'F');

  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('NEXUS PROTOCOL', MARGIN, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(item.name.toUpperCase(), MARGIN, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 160);
  const typeLabel = item.type === 'book' ? 'BOOK COMPANION GUIDE' : 'TRAINING PROTOCOL GUIDE';
  doc.text(typeLabel, MARGIN, 34);

  y = 50;

  // ─── Overview ───
  y = addSection(doc, 'OVERVIEW', content.overview, y);
  y = checkPageBreak(doc, y, 30);
  y = addSpacer(doc, y);

  // ─── Who is this for ───
  y = addSection(doc, 'WHO IS THIS FOR', content.whoIsThisFor, y);
  y = checkPageBreak(doc, y, 30);
  y = addSpacer(doc, y);

  // ─── Training Plan ───
  y = addHeading(doc, 'TRAINING PLAN', y);
  y = checkPageBreak(doc, y, 20);
  for (const step of content.trainingPlan) {
    y = addBulletPoint(doc, step, y);
  }
  y = addSpacer(doc, y);

  // ─── What You Get ───
  y = addHeading(doc, 'WHAT YOU GET', y);
  y = checkPageBreak(doc, y, 20);
  for (const item_text of content.whatYouGet) {
    y = addBulletPoint(doc, item_text, y);
  }
  y = addSpacer(doc, y);

  // ─── Quests Assigned ───
  y = addHeading(doc, 'QUESTS ASSIGNED', y);
  y = checkPageBreak(doc, y, 20);
  for (const quest of content.questsAssigned) {
    y = addQuestCard(doc, quest, y);
  }
  y = addSpacer(doc, y);

  // ─── PDF Guide sections ───
  y = addSection(doc, 'INTRODUCTION', content.pdfGuide.intro, y);
  y = addSpacer(doc, y);

  for (const section of content.pdfGuide.sections) {
    y = checkPageBreak(doc, y, 40);
    y = addSection(doc, section.heading.toUpperCase(), section.body, y);
    y = addSpacer(doc, y);
  }

  y = checkPageBreak(doc, y, 20);
  y = addSection(doc, 'CLOSING', content.pdfGuide.closing, y);

  // ─── Footer on every page ───
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 287, PAGE_WIDTH, 10, 'F');
    doc.setTextColor(100, 100, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`NEXUS Self-Evolution  ·  ${item.name}`, MARGIN, 293);
    doc.text(`Page ${i} / ${pageCount}`, PAGE_WIDTH - MARGIN - 20, 293);
  }

  // ─── Save ───
  const fileName = `NEXUS_${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Simple PDF for items without rich content (power-ups, etc.)
 */
function generateSimplePdf(item: StoreItem): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, PAGE_WIDTH, 40, 'F');

  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('NEXUS', MARGIN, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(item.name.toUpperCase(), MARGIN, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 160);
  doc.text('ITEM RECEIPT', MARGIN, 34);

  let y = 55;
  y = addSection(doc, 'DESCRIPTION', item.description, y);
  y = addSpacer(doc, y);
  y = addSection(doc, 'TYPE', item.type.toUpperCase(), y);
  y = addSpacer(doc, y);
  y = addSection(doc, 'COST', `${item.cost} Neural Credits`, y);

  if (item.powerUpEffect) {
    y = addSpacer(doc, y);
    y = addSection(doc, 'EFFECT', item.powerUpEffect, y);
  }
  if (item.duration && item.duration > 0) {
    y = addSpacer(doc, y);
    y = addSection(doc, 'DURATION', `${item.duration} hours`, y);
  }

  const fileName = `NEXUS_${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

// ─── Helper functions ───

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 285) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addHeading(doc: jsPDF, text: string, y: number): number {
  y = checkPageBreak(doc, y, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(52, 211, 153);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  doc.text(lines, MARGIN, y);
  return y + 8;
}

function addSection(doc: jsPDF, heading: string, body: string, y: number): number {
  y = addHeading(doc, heading, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 200, 210);

  const bodyLines = doc.splitTextToSize(body, CONTENT_WIDTH) as string[];
  for (const line of bodyLines) {
    y = checkPageBreak(doc, y, LINE_HEIGHT);
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
  return y;
}

function addBulletPoint(doc: jsPDF, text: string, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 200, 210);

  const lines = doc.splitTextToSize(`• ${text}`, CONTENT_WIDTH - 5) as string[];
  for (let i = 0; i < lines.length; i++) {
    y = checkPageBreak(doc, y, LINE_HEIGHT);
    const x = i === 0 ? MARGIN + 2 : MARGIN + 6;
    doc.text(lines[i], x, y);
    y += LINE_HEIGHT;
  }
  y += 2;
  return y;
}

function addQuestCard(doc: jsPDF, quest: { title: string; description: string; reward: string }, y: number): number {
  y = checkPageBreak(doc, y, 25);

  // Card background
  doc.setFillColor(20, 20, 28);
  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(52, 211, 153);
  doc.text(quest.title, MARGIN + 4, y + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 180, 190);
  const descLines = doc.splitTextToSize(quest.description, CONTENT_WIDTH - 10) as string[];
  doc.text(descLines[0] || '', MARGIN + 4, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(234, 179, 8);
  doc.text(`REWARD: ${quest.reward}`, MARGIN + 4, y + 12);

  return y + 20;
}

function addSpacer(doc: jsPDF, y: number): number {
  return y + 4;
}
