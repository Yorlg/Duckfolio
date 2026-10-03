"use client";

import { type ReactNode, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ConfigIcon,
  iconOptions,
  resolveLucideIcon,
} from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import type {
  ProfileConfig,
  ProjectLink,
  ProjectSection,
  SocialLink,
  WebsiteLink,
} from "@/types/platform-config";
import { Field, IconButton } from "./AdminShared";
import { readAdminResponse } from "./admin-api";
import { useTranslation } from "react-i18next";
import { adminMessageKeys } from "@/lib/admin/message-keys";
import { createId } from "./utils";
import { extractAvatarTheme } from "@/lib/avatar-theme";

type ConfigSectionKey = "profile" | "social" | "website" | "projects";

const ICONS_PER_PAGE = 12;

export function ConfigPanel({
  adminToken,
  config,
  isSaving,
  onConfigChange,
  onSave,
}: {
  adminToken: string;
  config: ProfileConfig;
  isSaving: boolean;
  onConfigChange: (config: ProfileConfig) => void;
  onSave: () => void;
}) {
  const { t } = useTranslation("admin");
  const [activeSection, setActiveSection] =
    useState<ConfigSectionKey>("profile");
  const projectSections = config.projectSections || [];
  const [uploadingImage, setUploadingImage] = useState<
    "avatar" | "logo" | null
  >(null);
  const [imageVersion, setImageVersion] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const setProfile = (profile: Partial<ProfileConfig["profile"]>) => {
    onConfigChange({
      ...config,
      profile: {
        ...config.profile,
        ...profile,
      },
    });
  };

  const uploadSiteImage = async (kind: "avatar" | "logo", file: File) => {
    if (!adminToken) return;

    setUploadingImage(kind);
    try {
      const formData = new FormData();
      const objectUrl =
        kind === "avatar" ? URL.createObjectURL(file) : undefined;
      let theme;
      try {
        if (objectUrl)
          theme = await extractAvatarTheme(objectUrl, "/avatar.png");
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
      formData.append("kind", kind);
      formData.append("file", file);
      const response = await fetch("/api/admin/site-image", {
        body: formData,
        headers: { "x-admin-token": adminToken },
        method: "POST",
      });
      await readAdminResponse(response, t("failedToUploadSiteImage"));
      if (kind === "avatar") {
        setProfile({ avatar: "/avatar.png", theme });
      }
      setImageVersion(Date.now());
      toast.success(
        kind === "avatar" ? t("avatarSavedHint") : t("logoReplaced"),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? t(adminMessageKeys[error.message] ?? error.message)
          : t("failedToUploadSiteImage"),
      );
    } finally {
      setUploadingImage(null);
      const input =
        kind === "avatar" ? avatarInputRef.current : logoInputRef.current;
      if (input) input.value = "";
    }
  };

  const updateSocialLink = (index: number, patch: Partial<SocialLink>) => {
    onConfigChange({
      ...config,
      socialLinks: config.socialLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    });
  };

  const updateWebsiteLink = (index: number, patch: Partial<WebsiteLink>) => {
    onConfigChange({
      ...config,
      websiteLinks: config.websiteLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    });
  };

  const updateProjectSection = (
    index: number,
    patch: Partial<ProjectSection>,
  ) => {
    onConfigChange({
      ...config,
      projectSections: projectSections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    });
  };

  const updateProject = (
    sectionIndex: number,
    projectIndex: number,
    patch: Partial<ProjectLink>,
  ) => {
    onConfigChange({
      ...config,
      projectSections: projectSections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              projects: section.projects.map((project, currentProjectIndex) =>
                currentProjectIndex === projectIndex
                  ? { ...project, ...patch }
                  : project,
              ),
            }
          : section,
      ),
    });
  };

  return (
    <section className="grid min-w-0 gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#121212]/10 pb-5 dark:border-white/10">
        <div>
          <h2 className="text-xl font-semibold">{t("siteConfiguration")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("siteConfigurationDescription")}
          </p>
        </div>
        <Button
          className="admin-primary-button"
          disabled={isSaving}
          type="button"
          onClick={onSave}
        >
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {t("saveConfiguration")}
        </Button>
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav
          aria-label={t("configSections")}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:sticky lg:top-6 lg:grid-cols-1 lg:self-start"
        >
          {(
            [
              ["profile", "basicInformation"],
              ["social", "socialLinks"],
              ["website", "websiteLinks"],
              ["projects", "projectGroups"],
            ] as const
          ).map(([section, label]) => (
            <button
              key={section}
              type="button"
              aria-current={activeSection === section ? "page" : undefined}
              className={cn(
                "min-w-0 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                activeSection === section
                  ? "bg-[#121212] text-white dark:bg-white dark:text-black"
                  : "text-muted-foreground hover:bg-[#121212]/5 hover:text-foreground dark:hover:bg-white/10",
              )}
              onClick={() => setActiveSection(section)}
            >
              {t(label)}
            </button>
          ))}
        </nav>
        <div className="grid min-w-0 gap-4 self-start">
          <div className={activeSection === "profile" ? "" : "hidden"}>
            <ConfigAccordionSection
              description={t("siteNameAvatarAndBio")}
              meta={t("basic")}
              title={t("basicInformation")}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t("name")}>
                  <input
                    className="admin-input"
                    value={config.profile.name}
                    onChange={(event) =>
                      setProfile({ name: event.target.value })
                    }
                  />
                </Field>
                <Field label={t("avatarPath")}>
                  <input
                    className="admin-input"
                    value={config.profile.avatar}
                    onChange={(event) =>
                      setProfile({ avatar: event.target.value })
                    }
                  />
                </Field>
                <Field label={t("bio")}>
                  <input
                    className="admin-input"
                    value={config.profile.bio}
                    onChange={(event) =>
                      setProfile({ bio: event.target.value })
                    }
                  />
                </Field>
              </div>
              <fieldset className="grid gap-3">
                <legend className="mb-3 text-sm text-[#121212]/50 dark:text-white/50">
                  {t("homepageStyle")}
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["classic", "minimal"] as const).map((style) => {
                    const selected =
                      (config.profile.style === "minimal"
                        ? "minimal"
                        : "classic") === style;
                    return (
                      <label key={style} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="homepage-style"
                          value={style}
                          checked={selected}
                          onChange={() => setProfile({ style })}
                          className="peer sr-only"
                        />
                        <div
                          className={cn(
                            "rounded-xl border p-4 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-foreground",
                            selected
                              ? "border-foreground bg-muted/50"
                              : "border-border hover:bg-muted/30",
                          )}
                        >
                          <div
                            aria-hidden="true"
                            className="flex h-32 items-center justify-center gap-5 rounded-lg bg-background px-5"
                          >
                            {style === "classic" && (
                              <div className="size-20 shrink-0 rounded-xl bg-foreground/15" />
                            )}
                            <div className="flex w-24 flex-col gap-2">
                              <div
                                className={cn(
                                  "rounded bg-foreground/25",
                                  style === "minimal" ? "h-4 w-16" : "h-3 w-20",
                                )}
                              />
                              <div className="h-1.5 w-full rounded bg-foreground/10" />
                              <div className="h-1.5 w-3/4 rounded bg-foreground/10" />
                              <div className="mt-2 flex gap-2">
                                {[0, 1, 2].map((index) => (
                                  <div
                                    key={index}
                                    className="size-2 rounded-full bg-foreground/20"
                                  />
                                ))}
                              </div>
                            </div>
                            {style === "minimal" && (
                              <div className="size-12 shrink-0 rounded-full bg-foreground/15" />
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                            <span>
                              {t(
                                style === "classic"
                                  ? "classicHomepageStyle"
                                  : "minimalHomepageStyle",
                              )}
                            </span>
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-full border",
                                selected
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border",
                              )}
                            >
                              {selected && <Check className="size-3" />}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("homepageStyleHint")}
                </p>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["avatar", "logo"] as const).map((kind) => (
                  <Field
                    key={kind}
                    label={
                      kind === "avatar"
                        ? t("uploadAvatarPNG")
                        : t("uploadLogoPNG")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <img
                        alt={
                          kind === "avatar"
                            ? t("currentAvatar")
                            : t("currentLogo")
                        }
                        className="size-12 rounded-md object-contain"
                        src={"/" + kind + ".png?v=" + imageVersion}
                      />
                      <Button
                        disabled={uploadingImage !== null}
                        type="button"
                        variant="outline"
                        onClick={() =>
                          (kind === "avatar"
                            ? avatarInputRef
                            : logoInputRef
                          ).current?.click()
                        }
                      >
                        {uploadingImage === kind ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {kind === "avatar"
                          ? t("replaceAvatar")
                          : t("replaceLogo")}
                      </Button>
                      <input
                        ref={kind === "avatar" ? avatarInputRef : logoInputRef}
                        accept="image/png"
                        className="hidden"
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadSiteImage(kind, file);
                        }}
                      />
                    </div>
                  </Field>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("siteImageDeploymentHint")}
              </p>
            </ConfigAccordionSection>
          </div>
          <div className={activeSection === "social" ? "" : "hidden"}>
            <ConfigAccordionSection
              actionLabel={t("add")}
              description={t("socialLinksDescription")}
              meta={`${config.socialLinks.length} ${t("items")}`}
              title={t("socialLinks")}
              onAction={() => {
                onConfigChange({
                  ...config,
                  socialLinks: [
                    ...config.socialLinks,
                    { icon: "", id: createId("social"), platform: "", url: "" },
                  ],
                });
              }}
            >
              {config.socialLinks.length ? (
                <div className="grid gap-4">
                  {config.socialLinks.map((link, index) => (
                    <div
                      key={link.id || index}
                      className="grid gap-3 rounded-lg border border-[#121212]/10 p-4 dark:border-white/10"
                    >
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_12rem_auto]">
                        <input
                          className="admin-input"
                          placeholder="id"
                          value={link.id}
                          onChange={(event) =>
                            updateSocialLink(index, { id: event.target.value })
                          }
                        />
                        <input
                          className="admin-input"
                          placeholder={t("platform")}
                          value={link.platform}
                          onChange={(event) =>
                            updateSocialLink(index, {
                              platform: event.target.value,
                            })
                          }
                        />
                        <input
                          className="admin-input"
                          placeholder="URL"
                          value={link.url}
                          onChange={(event) =>
                            updateSocialLink(index, { url: event.target.value })
                          }
                        />
                        <IconPicker
                          value={link.icon}
                          onChange={(icon) => updateSocialLink(index, { icon })}
                        />
                        <IconButton
                          label={t("delete")}
                          onClick={() =>
                            onConfigChange({
                              ...config,
                              socialLinks: config.socialLinks.filter(
                                (_, linkIndex) => linkIndex !== index,
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyConfigText>{t("noSocialLinksYet")}</EmptyConfigText>
              )}
            </ConfigAccordionSection>
          </div>
          <div className={activeSection === "website" ? "" : "hidden"}>
            <ConfigAccordionSection
              actionLabel={t("add")}
              description={t("websiteLinksDisplayedOnTheLinksPage")}
              meta={`${config.websiteLinks.length} ${t("items")}`}
              title={t("websiteLinks")}
              onAction={() => {
                onConfigChange({
                  ...config,
                  websiteLinks: [
                    ...config.websiteLinks,
                    {
                      description: "",
                      id: createId("link"),
                      title: "",
                      url: "",
                    },
                  ],
                });
              }}
            >
              {config.websiteLinks.length ? (
                <div className="grid gap-4">
                  {config.websiteLinks.map((link, index) => (
                    <div
                      key={link.id || index}
                      className="grid gap-3 rounded-lg border border-[#121212]/10 p-4 dark:border-white/10 md:grid-cols-[1fr_1fr_2fr_2fr_auto]"
                    >
                      <input
                        className="admin-input"
                        placeholder="id"
                        value={link.id}
                        onChange={(event) =>
                          updateWebsiteLink(index, { id: event.target.value })
                        }
                      />
                      <input
                        className="admin-input"
                        placeholder={t("title")}
                        value={link.title}
                        onChange={(event) =>
                          updateWebsiteLink(index, {
                            title: event.target.value,
                          })
                        }
                      />
                      <input
                        className="admin-input"
                        placeholder="URL"
                        value={link.url}
                        onChange={(event) =>
                          updateWebsiteLink(index, { url: event.target.value })
                        }
                      />
                      <input
                        className="admin-input"
                        placeholder={t("description")}
                        value={link.description || ""}
                        onChange={(event) =>
                          updateWebsiteLink(index, {
                            description: event.target.value,
                          })
                        }
                      />
                      <IconButton
                        label={"delete"}
                        onClick={() =>
                          onConfigChange({
                            ...config,
                            websiteLinks: config.websiteLinks.filter(
                              (_, linkIndex) => linkIndex !== index,
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyConfigText>{t("noWebsiteLinksYet")}</EmptyConfigText>
              )}
            </ConfigAccordionSection>
          </div>
          <div className={activeSection === "projects" ? "" : "hidden"}>
            <ConfigAccordionSection
              actionLabel={t("addGroup")}
              description={t("projectsDescription")}
              meta={`${projectSections.length} ${t("groups")}`}
              title={t("projectGroups")}
              onAction={() => {
                onConfigChange({
                  ...config,
                  projectSections: [
                    ...projectSections,
                    {
                      id: createId("project-section"),
                      projects: [],
                      title: "",
                    },
                  ],
                });
              }}
            >
              {projectSections.length ? (
                <div className="grid gap-6">
                  {projectSections.map((section, sectionIndex) => (
                    <div
                      key={section.id || sectionIndex}
                      className="grid gap-4"
                    >
                      <div className="grid gap-3 border-b border-[#121212]/10 pb-3 dark:border-white/10 md:grid-cols-[1fr_2fr_auto_auto]">
                        <input
                          className="admin-input"
                          placeholder={t("groupID")}
                          value={section.id}
                          onChange={(event) =>
                            updateProjectSection(sectionIndex, {
                              id: event.target.value,
                            })
                          }
                        />
                        <input
                          className="admin-input"
                          placeholder={t("groupTitle")}
                          value={section.title}
                          onChange={(event) =>
                            updateProjectSection(sectionIndex, {
                              title: event.target.value,
                            })
                          }
                        />
                        <Button
                          className="gap-2"
                          type="button"
                          variant="outline"
                          onClick={() =>
                            updateProjectSection(sectionIndex, {
                              projects: [
                                ...section.projects,
                                {
                                  description: "",
                                  icon: "TerminalSquare",
                                  id: createId("project"),
                                  title: "",
                                  url: "",
                                },
                              ],
                            })
                          }
                        >
                          <Plus className="size-4" />
                          {t("addProject")}
                        </Button>
                        <IconButton
                          label={t("deleteGroup")}
                          onClick={() =>
                            onConfigChange({
                              ...config,
                              projectSections: projectSections.filter(
                                (_, currentIndex) =>
                                  currentIndex !== sectionIndex,
                              ),
                            })
                          }
                        />
                      </div>

                      {section.projects.length ? (
                        <div className="grid gap-3">
                          {section.projects.map((project, projectIndex) => (
                            <div
                              key={project.id || projectIndex}
                              className="grid gap-3 rounded-lg border border-[#121212]/10 p-4 dark:border-white/10 md:grid-cols-[1fr_1.5fr_2fr_2fr_1fr_auto]"
                            >
                              <input
                                className="admin-input"
                                placeholder="id"
                                value={project.id}
                                onChange={(event) =>
                                  updateProject(sectionIndex, projectIndex, {
                                    id: event.target.value,
                                  })
                                }
                              />
                              <input
                                className="admin-input"
                                placeholder={"title"}
                                value={project.title}
                                onChange={(event) =>
                                  updateProject(sectionIndex, projectIndex, {
                                    title: event.target.value,
                                  })
                                }
                              />
                              <input
                                className="admin-input"
                                placeholder="URL"
                                value={project.url}
                                onChange={(event) =>
                                  updateProject(sectionIndex, projectIndex, {
                                    url: event.target.value,
                                  })
                                }
                              />
                              <input
                                className="admin-input"
                                placeholder={"description"}
                                value={project.description || ""}
                                onChange={(event) =>
                                  updateProject(sectionIndex, projectIndex, {
                                    description: event.target.value,
                                  })
                                }
                              />
                              <IconPicker
                                value={project.icon || ""}
                                onChange={(icon) =>
                                  updateProject(sectionIndex, projectIndex, {
                                    icon,
                                  })
                                }
                              />
                              <IconButton
                                label={t("deleteProject")}
                                onClick={() =>
                                  updateProjectSection(sectionIndex, {
                                    projects: section.projects.filter(
                                      (_, currentProjectIndex) =>
                                        currentProjectIndex !== projectIndex,
                                    ),
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyConfigText>
                          {t("thisGroupHasNoProjectsYet")}
                        </EmptyConfigText>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyConfigText>{t("noProjectGroupsYet")}</EmptyConfigText>
              )}
            </ConfigAccordionSection>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigAccordionSection({
  actionLabel,
  children,
  description,
  meta,
  title,
  onAction,
}: {
  actionLabel?: string;
  children: ReactNode;
  description: string;
  meta: string;
  title: string;
  onAction?: () => void;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-[#121212]/10 bg-white/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#121212]/10 px-5 py-4 dark:border-white/10">
        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
            {title}
            <span className="rounded bg-[#121212]/5 px-2 py-0.5 text-xs font-normal text-muted-foreground dark:bg-white/10">
              {meta}
            </span>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {onAction && (
          <Button
            className="gap-2"
            size="sm"
            type="button"
            variant="outline"
            onClick={onAction}
          >
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        )}
      </div>
      <div className="grid gap-5 p-5">{children}</div>
    </section>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const normalizedValue = value.trim();
  const hasCurrentOption = iconOptions.some(
    (option) => option.value === normalizedValue,
  );
  const currentOptions =
    normalizedValue && !hasCurrentOption && resolveLucideIcon(normalizedValue)
      ? [
          {
            keywords: [normalizedValue],
            label: t("currentIcon"),
            value: normalizedValue,
          },
        ]
      : [];
  const options = [...currentOptions, ...iconOptions];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = normalizedSearch
    ? options.filter((option) =>
        [option.label, option.value, ...option.keywords]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : options;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOptions.length / ICONS_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages - 1);
  const pagedOptions = filteredOptions.slice(
    safePage * ICONS_PER_PAGE,
    safePage * ICONS_PER_PAGE + ICONS_PER_PAGE,
  );
  const selectedOption = options.find(
    (option) => option.value === normalizedValue,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="h-10 justify-between rounded-md border border-[#121212]/10 bg-white px-3 text-[#121212] hover:bg-[#121212]/5 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-white/10"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-2">
            <ConfigIcon className="size-4 shrink-0" icon={normalizedValue} />
            <span className="truncate">
              {selectedOption?.label || t("icon")}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(21rem,calc(100vw-2rem))] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchIcons")}
            value={search}
            onValueChange={(nextSearch) => {
              setSearch(nextSearch);
              setPage(0);
            }}
          />
          <CommandList className="max-h-none p-2.5">
            {filteredOptions.length ? (
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {pagedOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "group relative grid h-14 place-items-center gap-0.5 rounded-md border border-[#121212]/10 bg-white/70 px-1 py-1 text-center text-[11px] transition-colors hover:border-[#121212]/25 hover:bg-[#121212]/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25 dark:hover:bg-white/10",
                      normalizedValue === option.value &&
                        "border-[#121212]/45 bg-[#121212]/10 dark:border-white/45 dark:bg-white/15",
                    )}
                    title={`${option.label} (${option.value})`}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <ConfigIcon
                      className="size-4.5 text-[#121212]/70 transition-colors group-hover:text-[#121212] dark:text-white/70 dark:group-hover:text-white"
                      icon={option.value}
                    />
                    <span className="line-clamp-1 w-full text-[#121212]/55 dark:text-white/55">
                      {option.label}
                    </span>
                    {normalizedValue === option.value && (
                      <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-[#121212] text-white dark:bg-white dark:text-black">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <CommandEmpty>
                <div className="grid gap-2 px-4 py-2 text-center text-sm text-[#121212]/50 dark:text-white/50">
                  <Search className="mx-auto size-4" />
                  <span>{t("noMatchingIconsFound")}</span>
                </div>
              </CommandEmpty>
            )}
          </CommandList>
          {filteredOptions.length > ICONS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-[#121212]/10 px-3 py-2 text-xs text-[#121212]/45 dark:border-white/10 dark:text-white/45">
              <Button
                className="h-7 gap-1 px-2"
                disabled={safePage === 0}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() =>
                  setPage((currentPage) => Math.max(0, currentPage - 1))
                }
              >
                <ChevronLeft className="size-3.5" />
                {t("previousPage")}
              </Button>
              <span>
                {safePage + 1} / {totalPages} {t("page")}
              </span>
              <Button
                className="h-7 gap-1 px-2"
                disabled={safePage >= totalPages - 1}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(totalPages - 1, currentPage + 1),
                  )
                }
              >
                {t("nextPage")}
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function EmptyConfigText({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[#121212]/10 px-4 py-6 text-sm text-[#121212]/45 dark:border-white/10 dark:text-white/45">
      {children}
    </div>
  );
}
