import { jsPDF } from 'jspdf';
import { StructuredFitnessPlan, UserSession } from '../types';

interface PdfGenerateOptions {
  plan: StructuredFitnessPlan;
  user?: UserSession | null;
}

export function generateFitnessPlanPdf({ plan, user }: PdfGenerateOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const planId = plan.planId || plan.id || plan.plan_id || `PLAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const userId = plan.userId || user?.userId || plan.user_id || 'U-GUEST';
  const planStatus = plan.planStatus || plan.status || 'Active';
  const generatedDate = plan.generatedDate || plan.generatedAt 
    ? new Date(plan.generatedDate || plan.generatedAt || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      currentY = margin;
      drawHeaderMini();
    }
  };

  const drawHeaderMini = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, currentY, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('AI FITNESS PLAN & NUTRITION PROTOCOL', margin + 3, currentY + 5.5);
    doc.text(`PLAN ID: ${planId}`, pageWidth - margin - 3, currentY + 5.5, { align: 'right' });
    currentY += 12;
  };

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PERSONALIZED AI FITNESS PLAN', margin + 6, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // Indigo light
  doc.text('Automated Intelligence Workout & Nutrition Architecture', margin + 6, currentY + 17);

  currentY += 29;

  // Metadata Card (Plan ID, User ID, Status, Generated Date, Goal, Experience)
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 5;
  const col2 = margin + contentWidth * 0.35;
  const col3 = margin + contentWidth * 0.7;

  // Row 1
  doc.text('PLAN ID:', col1, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(planId), col1 + 18, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('USER ID:', col2, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(userId), col2 + 16, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('STATUS:', col3, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74); // Green
  doc.text(String(planStatus).toUpperCase(), col3 + 15, currentY + 6);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('ATHLETE:', col1, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(plan.name || user?.fullName || 'User'), col1 + 18, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('GENERATED:', col2, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(generatedDate), col2 + 22, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('GOAL:', col3, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(plan.goal || 'Fitness'), col3 + 15, currentY + 14);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('LEVEL:', col1, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(plan.experienceLevel || 'Beginner'), col1 + 18, currentY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SCHEDULE:', col2, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(plan.workoutSchedule || 'Standard Split'), col2 + 22, currentY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('EQUIPMENT:', col3, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(plan.equipment || 'Standard Gym'), col3 + 22, currentY + 22);

  // Row 4
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DIET:', col1, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(plan.foodPreference || 'Balanced'), col1 + 18, currentY + 30);

  currentY += 40;

  const renderSectionHeader = (title: string, color: [number, number, number]) => {
    checkPageBreak(15);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(title, margin + 4, currentY + 4.8);
    currentY += 10;
  };

  const renderTextBlock = (text: string) => {
    // Clean markdown headings, asterisks, etc. for PDF readability
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/###\s*/g, '• ')
      .replace(/##\s*/g, '\n')
      .replace(/#\s*/g, '\n')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1');

    const lines = doc.splitTextToSize(cleanedText, contentWidth - 4);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(5);
      const line = lines[i];
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.text(line, margin + 2, currentY);
      currentY += 4.2;
    }
    currentY += 4;
  };

  // 1. WORKOUT PLAN SECTION
  renderSectionHeader('1. WORKOUT PLAN & TRAINING SCHEDULE', [79, 70, 229]); // Indigo

  const workoutPlanData = plan.workoutPlan || plan.weeklyWorkoutPlan || plan.workout_plan || plan.rawText;

  if (Array.isArray(workoutPlanData)) {
    workoutPlanData.forEach((day: any, dIdx: number) => {
      checkPageBreak(18);
      
      // Day Header
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin + 2, currentY, contentWidth - 4, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202);
      const dayTitle = `${day.day || `Day ${dIdx + 1}`}: ${day.focus || 'Workout Session'}`;
      doc.text(dayTitle, margin + 5, currentY + 4.2);
      currentY += 8;

      if (Array.isArray(day.exercises)) {
        day.exercises.forEach((ex: any) => {
          checkPageBreak(6);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          doc.text(`• ${ex.name || 'Exercise'}`, margin + 6, currentY);

          const meta = `${ex.sets || '3'} sets × ${ex.reps || '10-12 reps'}${ex.rest ? ` | Rest: ${ex.rest}` : ''}`;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(meta, pageWidth - margin - 6, currentY, { align: 'right' });

          if (ex.tips) {
            currentY += 3.5;
            doc.setFontSize(7.5);
            doc.setTextColor(120, 113, 108);
            doc.text(`   Tip: ${ex.tips}`, margin + 8, currentY);
          }

          currentY += 4.5;
        });
      } else if (typeof day === 'string') {
        renderTextBlock(day);
      }
      currentY += 3;
    });
  } else if (typeof workoutPlanData === 'string') {
    renderTextBlock(workoutPlanData);
  } else if (workoutPlanData && typeof workoutPlanData === 'object') {
    renderTextBlock(JSON.stringify(workoutPlanData, null, 2));
  } else {
    renderTextBlock('Follow the customized resistance and cardio split tailored to your selected fitness goals.');
  }

  currentY += 2;

  // 2. MEAL SUGGESTIONS SECTION
  renderSectionHeader('2. MEAL SUGGESTIONS & NUTRITION PROTOCOL', [16, 185, 129]); // Emerald

  const mealSuggestionsData = plan.mealSuggestions || plan.dietPlan || plan.meal_suggestions || plan.meals;

  if (Array.isArray(mealSuggestionsData)) {
    mealSuggestionsData.forEach((meal: any, mIdx: number) => {
      checkPageBreak(14);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin + 2, currentY, contentWidth - 4, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61);
      const mealTitle = `${meal.mealType || `Meal ${mIdx + 1}`}${meal.calories ? ` (${meal.calories} kcal)` : ''}`;
      doc.text(mealTitle, margin + 5, currentY + 4.2);
      currentY += 8;

      const desc = meal.description || meal.name || (typeof meal === 'string' ? meal : JSON.stringify(meal));
      const lines = doc.splitTextToSize(desc, contentWidth - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      for (const line of lines) {
        checkPageBreak(4.5);
        doc.text(line, margin + 6, currentY);
        currentY += 4;
      }
      currentY += 3;
    });
  } else if (typeof mealSuggestionsData === 'string') {
    renderTextBlock(mealSuggestionsData);
  } else if (mealSuggestionsData && typeof mealSuggestionsData === 'object') {
    renderTextBlock(JSON.stringify(mealSuggestionsData, null, 2));
  } else {
    renderTextBlock('Ensure adequate lean protein intake, clean complex carbohydrates, and essential fatty acids matching your metabolic rate.');
  }

  currentY += 2;

  // 3. WATER GOAL & IMPORTANT GUIDELINES
  if (plan.waterGoal || plan.importantNotes) {
    renderSectionHeader('3. HYDRATION TARGET & IMPORTANT SAFETY GUIDELINES', [6, 182, 212]); // Cyan

    if (plan.waterGoal) {
      checkPageBreak(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(14, 116, 144);
      doc.text(`Daily Water Goal: ${plan.waterGoal}`, margin + 3, currentY);
      currentY += 5;
    }

    if (plan.importantNotes) {
      if (Array.isArray(plan.importantNotes)) {
        plan.importantNotes.forEach((note: string) => {
          checkPageBreak(5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          const lines = doc.splitTextToSize(`• ${note}`, contentWidth - 6);
          for (const line of lines) {
            checkPageBreak(4);
            doc.text(line, margin + 3, currentY);
            currentY += 4;
          }
        });
      } else {
        renderTextBlock(String(plan.importantNotes));
      }
    }
  }

  // Add Page Numbers & Footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AI Fitness Plan Generator | Generated via n8n Webhook Intelligence', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Direct client-side device download
  const cleanFileName = `Fitness_Plan_${String(planId).replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(cleanFileName);
}
