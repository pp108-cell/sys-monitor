import useSolutionService from "@/services/useSolutionService";
import { message } from "antd";
import { generateAndUploadRepairReportPDF } from "@/components/repairReportTemplate";
import { useState } from "react";
import type { SolutionNote } from "@/services/useSolutionService/type";

const useSolution = () => {
  const {
    postGenerateSolution,
    getSolutionByReportId,
    getDeleteSolutionNote,
    getInsertSolutionNote,
    getEditSolutionNote,
    getSolutionNote,
    getSetSolutionNoteLike
  } = useSolutionService();

  const [solutionNoteList, setSolutionNoteList] = useState<SolutionNote[]>([]);

  const postAllgenerateSolution = async (id: number) => {
    return postGenerateSolution(id).then(res => res.data);
  }

  const generateSolution = async (selectedReportId: number) => {
    try {
      message.loading({ content: '正在生成解决方案...', key: 'generateSolution' });

      // 生成并下载PDF
      const success = await generateAndUploadRepairReportPDF(
        `修复建议报告_${selectedReportId}_${new Date().toISOString().slice(0, 10)}.pdf`,
        () => postAllgenerateSolution(selectedReportId)
      );

      if (success) {
        message.success({ content: '修复报告PDF生成成功！', key: 'generateSolution', duration: 2 });
      } else {
        message.error({ content: 'PDF生成失败，请重试', key: 'generateSolution', duration: 3 });
      }

      return success;
    } catch (error) {
      console.error('生成解决方案失败:', error);
      message.error({ content: '生成解决方案失败，请重试', key: 'generateSolution', duration: 3 });
      return false;
    }
  }

  const getAllSolutionNote = async () => {
    return getSolutionNote().then(res => setSolutionNoteList(res.data));
  }

  return {
    generateSolution,
    getSolutionByReportId,
    deleteSolutionNote: getDeleteSolutionNote,
    insertSolutionNote: getInsertSolutionNote,
    editSolutionNote: getEditSolutionNote,
    refreshSolutionList: getAllSolutionNote,
    solutionNoteList,
    setSolutionNoteLike: getSetSolutionNoteLike
  }
}

export default useSolution;