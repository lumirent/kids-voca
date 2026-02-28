import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  Settings2,
  Upload,
  X,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error - Vite specific import for worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface CardSetting {
  id: number;
  english: string;
  korean: string;
  category: string;
  hRatio: number | null;
  scale: number | null;
  vOffset: number | null;
  hOffset: number | null;
  imageData: string;
}

interface AdminProps {
  onBack: () => void;
}

const DEFAULT_VOCAB = [
  'barbershop, 이발소',
  'get a haircut, 이발하다',
  'post office, 우체국',
  'mail, 우편물',
  'letter, 편지',
  'fire station, 소방서',
  'learn, 배우다',
  'safety, 안전',
  'library, 도서관',
  'borrow, 빌리다',
  'bakery, 빵집',
  'buy, 사다',
  'grocery store, 식료품점',
  'groceries, 식료품',
  'pet store, 애완동물 가게',
  'neighbor, 이웃',
  'haircut, 이발',
  'about, ~에 대하여',
  'some, 약간의',
  'bread, 빵',
  'dog food, 강아지 사료',
];

const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const [vocabText, setVocabText] = useState(DEFAULT_VOCAB.join('\n'));
  const [cardSettings, setCardSettings] = useState<CardSetting[]>([]);
  const [currentImgSource, setCurrentImgSource] = useState<
    HTMLImageElement | HTMLCanvasElement | null
  >(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [batchCategory, setBatchCategory] = useState('Neighbors');

  // Global settings
  const [globalHRatio, setGlobalHRatio] = useState(70);
  const [globalScale, setGlobalScale] = useState(100);
  const [globalVOffset, setGlobalVOffset] = useState(0);
  const [globalHOffset, setGlobalHOffset] = useState(0);

  const [activeEditIdx, setActiveEditIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Drag state
  const dragRef = useRef<{
    isDragging: boolean;
    activeIdx: number | null;
    startX: number;
    startY: number;
    initialHOffset: number;
    initialVOffset: number;
    lastProcessedItem: CardSetting | null;
  }>({
    isDragging: false,
    activeIdx: null,
    startX: 0,
    startY: 0,
    initialHOffset: 0,
    initialVOffset: 0,
    lastProcessedItem: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  const initSettings = useCallback(() => {
    const lines = vocabText.split('\n').filter((l) => l.trim() !== '');
    const settings = lines.map((line, i) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        id: i + 1,
        english: parts[0] || `Word ${i + 1}`,
        korean: parts[1] || '',
        category: batchCategory,
        hRatio: null,
        scale: null,
        vOffset: null,
        hOffset: null,
        imageData: '',
      };
    });
    setCardSettings(settings);
    return settings;
  }, [vocabText, batchCategory]);

  const processSingleCard = useCallback(
    (
      index: number,
      settings: CardSetting[],
      source: HTMLImageElement | HTMLCanvasElement,
      gSettings: {
        hRatio: number;
        scale: number;
        vOffset: number;
        hOffset: number;
      },
    ) => {
      const item = { ...settings[index] };
      const hRatio =
        (item.hRatio !== null ? item.hRatio : gSettings.hRatio) / 100;
      const scale = (item.scale !== null ? item.scale : gSettings.scale) / 100;
      const vOff = item.vOffset !== null ? item.vOffset : gSettings.vOffset;
      const hOff = item.hOffset !== null ? item.hOffset : gSettings.hOffset;

      const imgW = source.width;
      const imgH = source.height;

      const baseStartX = imgW * 0.145;
      const baseStartY = imgH * 0.082;
      const baseEndX = imgW * 0.855;
      const baseEndY = imgH * 0.945;

      const cols = 3;
      const rows = 7;
      const cardW = ((baseEndX - baseStartX) * scale) / cols;
      const cardH = ((baseEndY - baseStartY) * scale) / rows;

      const r = Math.floor(index / cols);
      const c = index % cols;

      const sx = baseStartX + hOff + c * cardW;
      const sy = baseStartY + vOff + r * cardH;
      const targetH = cardH * hRatio;

      const canvas = workCanvasRef.current;
      if (!canvas) return item;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return item;

      canvas.width = cardW;
      canvas.height = targetH;
      ctx.clearRect(0, 0, cardW, targetH);
      ctx.drawImage(source, sx, sy, cardW, targetH, 0, 0, cardW, targetH);
      item.imageData = canvas.toDataURL('image/jpeg', 0.85);
      return item;
    },
    [],
  );

  const processAll = useCallback(
    (
      source: HTMLImageElement | HTMLCanvasElement | null = currentImgSource,
      settings: CardSetting[] = cardSettings,
    ) => {
      if (!source || settings.length === 0) return;

      setIsProcessing(true);
      const gSettings = {
        hRatio: globalHRatio,
        scale: globalScale,
        vOffset: globalVOffset,
        hOffset: globalHOffset,
      };

      const updatedSettings = settings.map((_, idx) =>
        processSingleCard(idx, settings, source, gSettings),
      );
      setCardSettings(updatedSettings);
      setIsProcessing(false);
    },
    [
      currentImgSource,
      cardSettings,
      globalHRatio,
      globalScale,
      globalVOffset,
      globalHOffset,
      processSingleCard,
    ],
  );

    // Drag handlers
    const handleDrag = useCallback(
      (e: MouseEvent | TouchEvent) => {
        const d = dragRef.current;
        if (!d.isDragging || d.activeIdx === null || !currentImgSource) return;
  
        const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  
        const deltaX = clientX - d.startX;
        const deltaY = clientY - d.startY;
  
        const gSettings = {
          hRatio: globalHRatio,
          scale: globalScale,
          vOffset: globalVOffset,
          hOffset: globalHOffset,
        };
  
        // Update values in the ref-held settings (avoiding frequent state triggers)
        const targetIdx = d.activeIdx!;
        const item = { ...cardSettings[targetIdx] };
        item.hOffset = d.initialHOffset - deltaX;
        item.vOffset = d.initialVOffset - deltaY;
  
        // Update the actual setting object for processing
        const tempSettings = [...cardSettings];
        tempSettings[targetIdx] = item;
  
        // Re-process image data for this single card manually
        const processedItem = processSingleCard(
          targetIdx,
          tempSettings,
          currentImgSource,
          gSettings,
        );
  
        // Directly update the image src in the DOM for smooth feedback
        const imgEl = document.getElementById(`img-${targetIdx}`) as HTMLImageElement;
        if (imgEl) {
          imgEl.src = processedItem.imageData;
        }
  
        // Keep track of the latest processed item to save on stop
        d.lastProcessedItem = processedItem;
      },
      [currentImgSource, globalHRatio, globalScale, globalVOffset, globalHOffset, processSingleCard, cardSettings],
    );
  
    const stopDrag = useCallback(() => {
      const d = dragRef.current;
      if (d.isDragging && d.activeIdx !== null && d.lastProcessedItem) {
        // Finalize the state update once at the end
        const targetIdx = d.activeIdx;
        const finalItem = d.lastProcessedItem;
        
        setCardSettings((prev) => {
          const next = [...prev];
          next[targetIdx] = finalItem;
          return next;
        });
      }
  
      d.isDragging = false;
      d.activeIdx = null;
      d.lastProcessedItem = null;
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', stopDrag);
    }, [handleDrag]);
    const initDrag = (
    e: React.MouseEvent | React.TouchEvent,
    idx: number,
  ) => {
    const item = cardSettings[idx];
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

    dragRef.current = {
      isDragging: true,
      activeIdx: idx,
      startX: clientX,
      startY: clientY,
      initialHOffset: item.hOffset ?? globalHOffset,
      initialVOffset: item.vOffset ?? globalVOffset,
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
  };

  // Effects for re-processing when global settings change
  useEffect(() => {
    if (currentImgSource && !isProcessing) {
      processAll();
    }
  }, [currentImgSource, isProcessing, processAll]);

  const renderPdfPage = async (num: number, doc: pdfjsLib.PDFDocumentProxy) => {
    const page = await doc.getPage(num);
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await page.render({ canvasContext: ctx, viewport }).promise;
    setCurrentImgSource(canvas);
    setPageNum(num);

    const settings = initSettings();
    processAll(canvas, settings);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const doc = await pdfjsLib.getDocument(typedarray).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        renderPdfPage(1, doc);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setCurrentImgSource(img);
          const settings = initSettings();
          processAll(img, settings);
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadJson = () => {
    const exportData = cardSettings.map((item) => ({
      id: item.id,
      english: item.english,
      korean: item.korean,
      imageData: item.imageData,
      category: item.category,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vocab_export_p${pageNum}_${Date.now()}.json`;
    a.click();
  };

  const downloadCsv = () => {
    let csv = 'ID,English,Korean,Category\n';
    for (const i of cardSettings) {
      csv += `${i.id},"${i.english}","${i.korean.replace(/,/g, '/')}", "${i.category}"\n`;
    }
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vocab_sheet_p${pageNum}_${Date.now()}.csv`;
    a.click();
  };

  const handleIndividualUpdate = (
    idx: number,
    key: keyof CardSetting,
    val: number,
  ) => {
    const newSettings = [...cardSettings];
    (newSettings[idx] as any)[key] = val;
    const gSettings = {
      hRatio: globalHRatio,
      scale: globalScale,
      vOffset: globalVOffset,
      hOffset: globalHOffset,
    };
    if (currentImgSource) {
      newSettings[idx] = processSingleCard(
        idx,
        newSettings,
        currentImgSource,
        gSettings,
      );
    }
    setCardSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-2 -ml-2 text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              메인으로 돌아가기
            </Button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              정밀 단어 카드 추출기 (Admin)
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Vocab Editor */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 sticky top-8">
              <h3 className="text-sm font-bold text-blue-600 mb-4 uppercase flex items-center">
                <Settings2 className="w-4 h-4 mr-2" />
                단어 리스트 편집
              </h3>
              <p className="text-[11px] text-slate-400 mb-3 font-medium leading-relaxed">
                형식: 영어, 한국어 (줄바꿈 구분)
              </p>
              <textarea
                value={vocabText}
                onChange={(e) => setVocabText(e.target.value)}
                rows={15}
                className="w-full text-xs border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-mono bg-slate-50 shadow-inner"
                placeholder="English, Korean"
              />
              <Button
                onClick={() => {
                  const settings = initSettings();
                  if (currentImgSource) processAll(currentImgSource, settings);
                }}
                className="w-full mt-4 bg-slate-900 hover:bg-black text-white"
              >
                변경사항 적용하기
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!currentImgSource ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center hover:border-blue-500 transition-all cursor-pointer shadow-sm group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf"
                />
                <div className="bg-blue-50 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-12 h-12 text-blue-500" />
                </div>
                <p className="text-slate-700 font-bold text-xl">
                  이미지 또는 PDF 업로드
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  여러 페이지 PDF도 지원합니다.
                </p>
              </div>
            ) : (
              <>
                {/* PDF Pagination */}
                {pdfDoc && (
                  <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center gap-6">
                    <Button
                      variant="ghost"
                      disabled={pageNum <= 1}
                      onClick={() => renderPdfPage(pageNum - 1, pdfDoc)}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="text-sm font-bold text-slate-700">
                      PAGE <span className="text-blue-600">{pageNum}</span> /{' '}
                      {totalPages}
                    </div>
                    <Button
                      variant="ghost"
                      disabled={pageNum >= totalPages}
                      onClick={() => renderPdfPage(pageNum + 1, pdfDoc)}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                )}

                {/* Global Controls */}
                <Card className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">
                        Crop Height ({globalHRatio}%)
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={globalHRatio}
                          onChange={(e) =>
                            setGlobalHRatio(parseInt(e.target.value, 10))
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">
                        Zoom / Scale ({globalScale}%)
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={globalScale}
                          onChange={(e) =>
                            setGlobalScale(parseInt(e.target.value, 10))
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">
                        V-Position ({globalVOffset})
                        <input
                          type="range"
                          min="-2000"
                          max="2000"
                          value={globalVOffset}
                          onChange={(e) =>
                            setGlobalVOffset(parseInt(e.target.value, 10))
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">
                        H-Position ({globalHOffset})
                        <input
                          type="range"
                          min="-1000"
                          max="1000"
                          value={globalHOffset}
                          onChange={(e) =>
                            setGlobalHOffset(parseInt(e.target.value, 10))
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-center pt-4 border-t border-slate-100">
                    <input
                      type="text"
                      value={batchCategory}
                      onChange={(e) => setBatchCategory(e.target.value)}
                      placeholder="일괄 카테고리 입력"
                      className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Button
                      onClick={() => {
                        const updated = cardSettings.map((c) => ({
                          ...c,
                          category: batchCategory,
                        }));
                        setCardSettings(updated);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      카테고리 일괄 적용
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentImgSource(null);
                        setPdfDoc(null);
                      }}
                    >
                      새 파일 업로드
                    </Button>
                  </div>
                </Card>

                {/* Results Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
                    <h2 className="text-lg font-bold text-slate-700">
                      추출 결과 ({cardSettings.length}개)
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={downloadCsv}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9"
                      >
                        <FileSpreadsheet className="w-4 h-4" /> CSV 저장
                      </Button>
                      <Button
                        onClick={downloadJson}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9"
                      >
                        <FileJson className="w-4 h-4" /> JSON 저장
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cardSettings.map((item, idx) => (
                      <Card
                        key={item.id}
                        className="relative overflow-hidden flex flex-col group transition-all hover:shadow-lg"
                      >
                        <div
                          onMouseDown={(e) => initDrag(e, idx)}
                          onTouchStart={(e) => initDrag(e, idx)}
                          className="bg-slate-50 flex items-center justify-center h-48 p-2 overflow-hidden cursor-move relative touch-none"
                        >
                          {item.imageData ? (
                            <img
                              id={`img-${idx}`}
                              src={item.imageData}
                              alt={item.english}
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          ) : (
                            <div className="animate-pulse bg-slate-200 w-full h-full" />
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={() =>
                                setActiveEditIdx(
                                  activeEditIdx === idx ? null : idx,
                                )
                              }
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-black text-blue-700 uppercase truncate">
                              {item.english}
                            </p>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {item.korean || '-'}
                          </p>
                        </div>

                        {/* Individual Edit Panel */}
                        {activeEditIdx === idx && (
                          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm p-5 flex flex-col justify-center space-y-4 border-2 border-blue-400 rounded-xl">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                개별 조정
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setActiveEditIdx(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">
                                Crop Height ({item.hRatio || globalHRatio}%)
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  value={item.hRatio || globalHRatio}
                                  onChange={(e) =>
                                    handleIndividualUpdate(
                                      idx,
                                      'hRatio',
                                      parseInt(e.target.value, 10),
                                    )
                                  }
                                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                              </label>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">
                                Zoom ({item.scale || globalScale}%)
                                <input
                                  type="range"
                                  min="50"
                                  max="150"
                                  value={item.scale || globalScale}
                                  onChange={(e) =>
                                    handleIndividualUpdate(
                                      idx,
                                      'scale',
                                      parseInt(e.target.value, 10),
                                    )
                                  }
                                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvases for processing */}
      <canvas ref={workCanvasRef} className="hidden" />
      <canvas ref={pdfCanvasRef} className="hidden" />
    </div>
  );
};

export default Admin;
