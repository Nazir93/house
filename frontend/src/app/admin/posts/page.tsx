"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X, FileText, Eye, EyeOff, Trash2 } from "lucide-react";

type Post = {
  id: string;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  createdAt: string;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/posts?${params}`);
      if (!res.ok) throw new Error();
      setPosts(await res.json());
    } catch {
      setError("Не удалось загрузить записи");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  async function togglePublished(id: string, published: boolean) {
    await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    fetchPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить запись?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Новости</h1>
          <p className="text-sm text-white/40 mt-1">Управление публикациями блога</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Создать
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или категории..."
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30 text-sm">Загрузка...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-white/15 mb-3" />
            <p className="text-white/30 text-sm mb-4">Записей пока нет</p>
            <Link
              href="/admin/posts/new"
              className="text-emerald-300 hover:text-emerald-200 text-sm transition-colors"
            >
              Создать первую запись
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/posts/${post.id}`} className="text-white hover:text-emerald-300 font-medium text-sm transition-colors">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/30">{post.category}</span>
                    <span className="text-xs text-white/20">{new Date(post.createdAt).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <button
                    onClick={() => togglePublished(post.id, post.published)}
                    className={`p-2 rounded-lg transition-colors ${
                      post.published ? "text-green-400 hover:bg-green-500/10" : "text-white/20 hover:bg-white/5 hover:text-white/40"
                    }`}
                    title={post.published ? "Снять с публикации" : "Опубликовать"}
                  >
                    {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
