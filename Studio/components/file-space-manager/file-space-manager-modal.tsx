import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { QUERY_GET_FILE_SPACE_INFO_KEY } from "@/lib/constants";
import {
  IFileItem,
  IFileSpaceInfo,
  TFileSpaceSelectionType,
} from "@/types/file-space";
import { getLastItem } from "@/utils/arrays";
import formatFileSize from "@/utils/format-file-size";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Edit2,
  FileIcon,
  Folder,
  FolderPlusIcon,
  Home,
  RotateCcwIcon,
  ScissorsIcon,
  Search,
  Trash2,
  UploadIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { FileSpaceDeleteModal } from "./file-space-delete-modal";
import { FileSpaceEditDirectoryModal } from "./file-space-directory-info-modal";
import FileSpaceManagerGridItem from "./file-space-manager-grid-item";
import { FileSpacePasteModal } from "./file-space-paste-modal";
import FileSpaceStorageUsage from "./file-space-storage-usage";
import { FileSpaceUploadModal } from "./file-space-upload-modal";

type TFileSpaceManagerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected?: (file: IFileItem) => void;
  selectionFileType?: TFileSpaceSelectionType;
};

function deepSearch(content: IFileItem[], query: string) {
  const result: IFileItem[] = [];

  for (const item of content) {
    if (item.name.includes(query)) {
      result.push(item);
    }

    if (item.contents && Array.isArray(item.contents)) {
      const nestedResults = deepSearch(item.contents, query);
      result.push(...nestedResults);
    }
  }

  return result;
}

export default function FileSpaceManagerModal({
  open,
  onOpenChange,
  onFileSelected,
  selectionFileType = "all",
}: TFileSpaceManagerModalProps) {
  const { refreshToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryStack, setDirectoryStack] = useState<IFileItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<IFileItem | null>(null);
  const [cuttingItem, setCuttingItem] = useState<IFileItem | null>(null);
  const [openDirectoryModal, setOpenDirectoryModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openPasteModal, setOpenPasteModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // Refetch the query every time the modal opens
  useEffect(() => {
    if (open) {
      getFileSpaceInfo.refetch();
    } else {
      setSearchQuery("");
      setDirectoryStack([]);
      setSelectedItem(null);
    }
  }, [open]);

  const getFileSpaceInfo = useQuery({
    queryKey: QUERY_GET_FILE_SPACE_INFO_KEY,
    enabled: open,
    queryFn: async () => {
      await refreshToken();
      const response = await Api.get<IFileSpaceInfo>("/studio/space/");
      return response.data;
    },
  });

  // Update directoryStack after each refetching!
  useEffect(() => {
    if (!getFileSpaceInfo.data || directoryStack.length === 0) return;

    const newContent = getFileSpaceInfo.data.content;
    const _newDirStack: IFileItem[] = [];
    let _pervDir: IFileItem | undefined;
    const _dirStack = [...directoryStack];

    while (_dirStack.length > 0) {
      const _oldDir = _dirStack.shift();
      const _content = _pervDir?.contents ?? newContent;
      _pervDir = _content.find((d) => d.id === _oldDir?.id);
      if (_pervDir) _newDirStack.push(_pervDir);
    }

    setDirectoryStack(_newDirStack);
  }, [getFileSpaceInfo.data]);

  const currentDirectory: IFileItem | undefined = useMemo(
    () => getLastItem(directoryStack),
    [directoryStack]
  );

  const content = useMemo(() => {
    if (getFileSpaceInfo.data) {
      let _content = getFileSpaceInfo.data.content;
      const _searchQuery = searchQuery.trim();

      if (_searchQuery.length > 0) {
        _content = deepSearch(_content, _searchQuery);
      } else {
        _content = currentDirectory?.contents ?? _content;
      }

      // Sorting by name
      _content.sort((a, b) => a.name.localeCompare(b.name));

      // Placing directories at the beginning of the list
      _content.sort((a, b) => {
        const aHas = a.contents != null;
        const bHas = b.contents != null;
        return Number(bHas) - Number(aHas);
      });

      return _content;
    }

    return [];
  }, [getFileSpaceInfo.data, currentDirectory, searchQuery]);

  function navigateHome() {
    setDirectoryStack([]);
  }

  function navigateUp(count: number = 1) {
    const _tempDirectoryStack = [...directoryStack];

    for (let index = 0; index < count; index++) {
      _tempDirectoryStack.pop();
    }

    setDirectoryStack(_tempDirectoryStack);
    setSelectedItem(null);
  }

  function navigateTo(dir: IFileItem) {
    const _tempDirectoryStack = [...directoryStack];
    _tempDirectoryStack.push(dir);
    setDirectoryStack(_tempDirectoryStack);
    setSearchQuery("");
    setSelectedItem(null);
  }

  const isLoadingFiles =
    getFileSpaceInfo.isLoading || getFileSpaceInfo.isFetching;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[900px] max-h-[80vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg flex-col dark:bg-[#0D1117]">
            <DialogHeader>
              <DialogTitle className="text-xl">File Manager</DialogTitle>
              <DialogClose onClick={() => onOpenChange(false)} />
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col p-0">
              {/* Top toolbar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateUp()}
                    disabled={isLoadingFiles || directoryStack.length === 0}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={navigateHome}
                    disabled={isLoadingFiles || directoryStack.length === 0}
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={isLoadingFiles}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isLoadingFiles}
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: QUERY_GET_FILE_SPACE_INFO_KEY,
                      })
                    }
                  >
                    <RotateCcwIcon className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOpenDirectoryModal(true)}
                    disabled={isLoadingFiles}
                  >
                    <FolderPlusIcon className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="default"
                    onClick={() => setOpenUploadModal(true)}
                    disabled={isLoadingFiles}
                  >
                    <UploadIcon className="h-5 w-5" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Breadcrumb navigation with actions */}
              <div className="py-3 flex items-center justify-between">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        onClick={navigateHome}
                        className="cursor-pointer"
                      >
                        Home
                      </BreadcrumbLink>
                    </BreadcrumbItem>

                    {directoryStack.map((dir, index) => (
                      <Fragment key={dir.id}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {index === directoryStack.length - 1 ? (
                            <span className="cursor-default">{dir.name}</span>
                          ) : (
                            <BreadcrumbLink
                              onClick={() => navigateUp(index + 1)}
                              className="cursor-pointer"
                            >
                              {dir.name}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-1">
                  {cuttingItem && (
                    <Tooltip>
                      <TooltipContent side="bottom">Paste Here</TooltipContent>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isLoadingFiles}
                          onClick={() => setOpenPasteModal(true)}
                        >
                          <FileIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                    </Tooltip>
                  )}

                  {selectedItem ? (
                    <>
                      {selectedItem.contents != null && (
                        <Tooltip>
                          <TooltipContent side="bottom">Edit</TooltipContent>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isLoadingFiles}
                              onClick={() => setOpenDirectoryModal(true)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                        </Tooltip>
                      )}

                      {selectedItem.contents == null && (
                        <Tooltip>
                          <TooltipContent side="bottom">Cut</TooltipContent>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isLoadingFiles}
                              onClick={() => {
                                setCuttingItem(selectedItem);
                                setSelectedItem(null);
                              }}
                            >
                              <ScissorsIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipContent side="bottom">Delete</TooltipContent>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            disabled={isLoadingFiles}
                            onClick={() => setOpenDeleteModal(true)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                      </Tooltip>
                    </>
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
              </div>

              <Separator className="mb-2" />

              {/* Main content area */}
              <div className="h-[400px] overflow-y-auto">
                {isLoadingFiles ? (
                  // Loading skeleton
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="rounded-md p-2">
                        <div className="flex flex-col items-center text-center gap-1">
                          <Skeleton className="h-10 w-10 rounded" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : getFileSpaceInfo.isError ? (
                  // Error state
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <AlertCircle className="h-16 w-16 mb-4 opacity-20 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">
                      Failed to load files
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => getFileSpaceInfo.refetch()}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : content.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Folder className="h-16 w-16 mb-4 opacity-20" />
                    <p>No files found</p>
                    {searchQuery ? (
                      <p className="text-sm">Try a different search term</p>
                    ) : (
                      <p className="text-sm">Upload files to get started</p>
                    )}
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {content.map((item) => (
                      <FileSpaceManagerGridItem
                        key={item.id}
                        data={item}
                        isSelected={selectedItem?.id === item.id}
                        isCutting={cuttingItem?.id === item.id}
                        selectionFileType={selectionFileType}
                        searchQuery={searchQuery}
                        onSelect={setSelectedItem}
                        onDoubleClickDir={navigateTo}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="h-5 flex items-center">
                {selectedItem && (
                  <div className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{selectedItem.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <span>
                      {formatFileSize(
                        selectedItem.size ?? selectedItem.total_size ?? NaN
                      )}
                    </span>
                    {selectedItem.contents != null && (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        <span>{selectedItem.contents.length} Items</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Separator className="mt-2" />
            </div>

            <DialogFooter className="flex flex-row !justify-between items-center mt-0">
              <div className="flex items-center gap-4">
                {getFileSpaceInfo.isPending ||
                getFileSpaceInfo.isFetching ||
                !getFileSpaceInfo.data ? (
                  <>
                    <Skeleton className="w-[60px] h-[60px] rounded-full" />
                    <div>
                      <Skeleton className="w-36 h-5 rounded-md" />
                      <Skeleton className="w-24 h-5 mt-1 rounded-md" />
                    </div>
                  </>
                ) : (
                  <>
                    <FileSpaceStorageUsage
                      used={getFileSpaceInfo.data.used_space_mb}
                      total={getFileSpaceInfo.data.total_space_mb}
                      size={60}
                    />

                    <div>
                      <div className="text-sm font-medium">
                        {getFileSpaceInfo.data.used_space_mb.toFixed(1)} MB of{" "}
                        {(getFileSpaceInfo.data.total_space_mb / 1000).toFixed(
                          1
                        )}{" "}
                        GB used
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 p-0 text-xs text-blue-500 hover:text-blue-700"
                      >
                        Buy More Space
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>

                {onFileSelected && (
                  <Button
                    disabled={
                      selectedItem == null || selectedItem.contents != null
                    }
                    onClick={() => {
                      if (selectedItem) {
                        onFileSelected(selectedItem);
                        onOpenChange(false);
                      }
                    }}
                  >
                    Select
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <FileSpaceEditDirectoryModal
        open={openDirectoryModal}
        directory={selectedItem}
        parentId={currentDirectory?.id}
        onOpenChange={setOpenDirectoryModal}
      />

      <FileSpaceUploadModal
        open={openUploadModal}
        parentId={currentDirectory?.id}
        onOpenChange={setOpenUploadModal}
      />

      {cuttingItem && (
        <FileSpacePasteModal
          open={openPasteModal}
          item={cuttingItem}
          targetDir={getLastItem(directoryStack)}
          homeTotalItems={getFileSpaceInfo.data?.content.length ?? 0}
          onOpenChange={setOpenPasteModal}
          onPaste={() => setCuttingItem(null)}
        />
      )}

      {selectedItem && (
        <FileSpaceDeleteModal
          open={openDeleteModal}
          item={selectedItem}
          onOpenChange={setOpenDeleteModal}
          onDelete={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
