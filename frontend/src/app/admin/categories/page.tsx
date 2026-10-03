'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '../adminCrud.module.css';
import { categoryService, CategoryTreeItem, CategoryRequest } from '../../../services/categoryService';

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  const [tree, setTree] = useState<CategoryTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTreeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Tree expanded states
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  // Form State
  const [formData, setFormData] = useState<CategoryRequest>({
    name: '',
    slug: '',
    parentId: null,
    iconUrl: '',
    imageUrl: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [flatList, treeData] = await Promise.all([
        categoryService.getAllCategories(false),
        categoryService.getCategoryTree(false),
      ]);
      setCategories(flatList);
      setTree(treeData);

      // Mặc định mở tất cả các node cấp 1
      const initialExpanded: Record<number, boolean> = {};
      treeData.forEach((node) => {
        initialExpanded[node.categoryId] = true;
      });
      setExpandedNodes(initialExpanded);
    } catch (err) {
      setAlert({ type: 'error', message: 'Không thể tải danh sách danh mục từ máy chủ.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  const toggleExpand = (id: number) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExp: Record<number, boolean> = {};
    const traverse = (items: CategoryTreeItem[]) => {
      items.forEach((item) => {
        allExp[item.categoryId] = true;
        if (item.children?.length) traverse(item.children);
      });
    };
    traverse(tree);
    setExpandedNodes(allExp);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Tạo slug từ chuỗi tiếng Việt
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
    }));
  };

  const openCreateModal = (parentId: number | null = null) => {
    setEditingCategory(null);
    setAutoSlug(true);
    setFormData({
      name: '',
      slug: '',
      parentId: parentId,
      iconUrl: '',
      imageUrl: '',
      description: '',
      sortOrder: (categories.length + 1) * 5,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryTreeItem) => {
    setEditingCategory(cat);
    setAutoSlug(false);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      iconUrl: cat.iconUrl || '',
      imageUrl: cat.imageUrl || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAlert('error', 'Vui lòng nhập tên danh mục!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CategoryRequest = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.name),
        parentId: formData.parentId ? Number(formData.parentId) : null,
        sortOrder: Number(formData.sortOrder) || 0,
        iconUrl: formData.iconUrl?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        description: formData.description?.trim() || null,
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.categoryId, payload);
        showAlert('success', `Cập nhật danh mục "${payload.name}" thành công!`);
      } else {
        await categoryService.createCategory(payload);
        showAlert('success', `Thêm mới danh mục "${payload.name}" thành công!`);
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving category:', err);
      const errMsg = err?.response?.data?.message || err.message || 'Lỗi khi lưu danh mục.';
      showAlert('error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickToggleActive = async (cat: CategoryTreeItem) => {
    const newActive = !cat.isActive;
    const updateNode = (nodes: CategoryTreeItem[]): CategoryTreeItem[] =>
      nodes.map((node) => ({
        ...node,
        isActive: node.categoryId === cat.categoryId ? newActive : node.isActive,
        children: node.children ? updateNode(node.children) : [],
      }));

    setCategories((prev) =>
      prev.map((item) => (item.categoryId === cat.categoryId ? { ...item, isActive: newActive } : item))
    );
    setTree((prev) => updateNode(prev));

    try {
      await categoryService.updateCategory(cat.categoryId, {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        isActive: newActive,
      });
      showAlert('success', `Đã ${newActive ? 'kích hoạt' : 'vô hiệu hóa'} danh mục "${cat.name}".`);
    } catch (err: any) {
      await loadData();
      const msg = err?.response?.data?.message || 'Không thể thay đổi trạng thái danh mục.';
      showAlert('error', msg);
    }
  };

  const handleDelete = async (cat: CategoryTreeItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" (ID: ${cat.categoryId})?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(cat.categoryId);
      showAlert('success', `Đã xóa danh mục "${cat.name}" thành công!`);
      await loadData();
    } catch (err: any) {
      console.error('Lỗi xóa danh mục:', err);
      if (err?.response?.status === 409) {
        showAlert(
          'error',
          `Không thể xóa danh mục "${cat.name}" vì đang có danh mục con hoặc sản phẩm liên kết! Hãy chuyển hoặc xóa các mục phụ thuộc trước.`
        );
      } else {
        showAlert('error', err?.response?.data?.message || 'Lỗi hệ thống khi xóa danh mục.');
      }
    }
  };

  // Helper tìm tên cha
  const getParentName = (parentId: number | null) => {
    if (!parentId) return '— (Gốc)';
    const parent = categories.find((c) => c.categoryId === parentId);
    return parent ? `${parent.iconUrl ? parent.iconUrl + ' ' : ''}${parent.name}` : `ID ${parentId}`;
  };

  // Danh sách cha hợp lệ khi sửa (ngăn chọn chính nó hoặc con cháu)
  const validParentOptions = useMemo(() => {
    if (!editingCategory) return categories;
    // Thu thập ID của chính nó và tất cả con cháu
    const invalidIds = new Set<number>([editingCategory.categoryId]);
    const addDescendants = (nodeId: number) => {
      categories
        .filter((c) => c.parentId === nodeId)
        .forEach((child) => {
          invalidIds.add(child.categoryId);
          addDescendants(child.categoryId);
        });
    };
    addDescendants(editingCategory.categoryId);

    return categories.filter((c) => !invalidIds.has(c.categoryId));
  }, [categories, editingCategory]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = categories.length;
    const roots = categories.filter((c) => !c.parentId).length;
    const active = categories.filter((c) => c.isActive).length;
    const children = total - roots;
    return { total, roots, children, active };
  }, [categories]);

  // Lọc dữ liệu bảng
  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      const matchKeyword =
        !searchKeyword ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.categoryId.toString().includes(searchKeyword);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'inactive' && !item.isActive);

      return matchKeyword && matchStatus;
    });
  }, [categories, searchKeyword, statusFilter]);

  // Render Tree recursively
  const renderTreeNode = (node: CategoryTreeItem, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.categoryId];

    // Filter tree search keyword
    const matchKeyword =
      !searchKeyword ||
      node.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      node.slug.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && node.isActive) ||
      (statusFilter === 'inactive' && !node.isActive);

    if (searchKeyword && !matchKeyword && !hasChildren) return null;

    return (
      <div key={node.categoryId} className={styles.treeNode}>
        <div
          className={styles.treeRow}
          style={{ opacity: matchStatus ? 1 : 0.4 }}
        >
          <div className={styles.treeLeft}>
            {hasChildren ? (
              <button
                type="button"
                className={styles.treeToggleBtn}
                onClick={() => toggleExpand(node.categoryId)}
                title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isExpanded ? '▼' : '►'}
              </button>
            ) : (
              <span style={{ width: 22, display: 'inline-block' }} />
            )}

            <span className={styles.treeIcon}>{node.iconUrl || '📁'}</span>
            <span className={styles.treeName}>{node.name}</span>
            <span className={styles.treeSlug}>/{node.slug}</span>

            {hasChildren && (
              <span className={styles.treeChildrenCount}>
                {node.children.length} mục con
              </span>
            )}
          </div>

          <div className={styles.treeRight}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Thứ tự: {node.sortOrder}</span>

            <button
              type="button"
              className={styles.btnToggle}
              onClick={() => handleQuickToggleActive(node)}
              title={node.isActive ? 'Nhấn để vô hiệu hóa' : 'Nhấn để kích hoạt'}
            >
              {node.isActive ? (
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>● Đang hiện</span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeMuted}`}>○ Ẩn</span>
              )}
            </button>

            <div className={styles.actionGroup}>
              <button
                type="button"
                className={styles.btnIcon}
                title="Thêm mục con"
                onClick={() => openCreateModal(node.categoryId)}
              >
                ➕
              </button>
              <button
                type="button"
                className={`${styles.btnIcon} ${styles.btnIconEdit}`}
                title="Chỉnh sửa"
                onClick={() => openEditModal(node)}
              >
                ✏️
              </button>
              <button
                type="button"
                className={`${styles.btnIcon} ${styles.btnIconDelete}`}
                title="Xóa danh mục"
                onClick={() => handleDelete(node)}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.treeChildren}>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Tiêu đề & Nút thao tác đầu trang */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>📁 Quản lý Danh mục (Categories)</h1>
          <p>Quản lý cấu trúc danh mục đa cấp, menu điều hướng và phân nhóm sản phẩm</p>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnPrimary} onClick={() => openCreateModal(null)}>
            <span>➕</span> Thêm Danh mục mới
          </button>
        </div>
      </div>

      {/* Thông báo Alert Banner */}
      {alert && (
        <div className={`${styles.alertBanner} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span>{alert.message}</span>
          <button className={styles.alertCloseBtn} onClick={() => setAlert(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Thẻ chỉ số tổng quan */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>📁</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Tổng số danh mục</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>🌳</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.roots}</span>
            <span className={styles.statLabel}>Danh mục gốc (Root)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>🌿</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.children}</span>
            <span className={styles.statLabel}>Danh mục con các cấp</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>✅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>Đang kích hoạt</span>
          </div>
        </div>
      </div>

      {/* Thanh công cụ lọc & Chuyển đổi giao diện Tree / Table */}
      <div className={styles.toolbarCard}>
        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm danh mục theo tên, slug, ID..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Chỉ đang hiện (Active)</option>
            <option value="inactive">Chỉ đang ẩn (Inactive)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {viewMode === 'tree' && (
            <>
              <button className={styles.btnSecondary} onClick={expandAll} title="Mở rộng tất cả">
                <span>➕</span> Mở hết
              </button>
              <button className={styles.btnSecondary} onClick={collapseAll} title="Thu gọn tất cả">
                <span>➖</span> Thu hết
              </button>
            </>
          )}

          <div className={styles.viewToggleGroup}>
            <button
              className={`${styles.viewToggleBtn} ${viewMode === 'tree' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('tree')}
            >
              🌳 Dạng Cây
            </button>
            <button
              className={`${styles.viewToggleBtn} ${viewMode === 'table' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('table')}
            >
              📋 Dạng Bảng
            </button>
          </div>
        </div>
      </div>

      {/* Khu vực hiển thị dữ liệu chính */}
      <div className={styles.contentCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <p className={styles.emptyTitle}>Đang tải dữ liệu danh mục...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <p className={styles.emptyTitle}>Chưa có danh mục nào</p>
            <p className={styles.emptyDesc}>Bấm &quot;Thêm Danh mục mới&quot; để khởi tạo cây danh mục sản phẩm.</p>
          </div>
        ) : viewMode === 'tree' ? (
          /* GIAO DIỆN DẠNG CÂY (TREE VIEW) */
          <div className={styles.treeContainer}>
            {tree.map((rootNode) => renderTreeNode(rootNode))}
          </div>
        ) : (
          /* GIAO DIỆN DẠNG BẢNG (TABLE VIEW) */
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Icon & Tên danh mục</th>
                  <th>Slug URL</th>
                  <th>Danh mục cha</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Thứ tự</th>
                  <th style={{ textAlign: 'center', width: 130 }}>Trạng thái</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                      Không tìm thấy danh mục phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.categoryId}>
                      <td style={{ fontWeight: 700, color: '#9ca3af' }}>#{cat.categoryId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{cat.iconUrl || '📁'}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{cat.name}</div>
                            {cat.description && (
                              <div style={{ fontSize: 12, color: '#9ca3af', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cat.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.treeSlug}>/{cat.slug}</span>
                      </td>
                      <td style={{ color: cat.parentId ? '#d1d5db' : '#9ca3af' }}>
                        {getParentName(cat.parentId)}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{cat.sortOrder}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={styles.btnToggle}
                          onClick={() => handleQuickToggleActive(cat)}
                          title="Nhấn để đổi trạng thái"
                        >
                          {cat.isActive ? (
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>● Đang hiện</span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeMuted}`}>○ Đang ẩn</span>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionGroup} style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className={`${styles.btnIcon} ${styles.btnIconEdit}`}
                            title="Sửa danh mục"
                            onClick={() => openEditModal(cat)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className={`${styles.btnIcon} ${styles.btnIconDelete}`}
                            title="Xóa danh mục"
                            onClick={() => handleDelete(cat)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM / CHỈNH SỬA DANH MỤC */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => !isSubmitting && setShowModal(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingCategory ? '✏️ Chỉnh sửa Danh mục' : '➕ Thêm Danh mục mới'}
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !isSubmitting && setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {/* Tên danh mục */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tên danh mục <span className={styles.formRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ví dụ: Điện thoại, Laptop, Âm thanh..."
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                {/* Slug URL */}
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel}>Slug đường dẫn URL</label>
                    <label style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                      />
                      Tự sinh từ tên
                    </label>
                  </div>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="dien-thoai, laptop..."
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                  />
                  <span className={styles.formHelp}>Dùng để tạo đường link thân thiện SEO: /category/{formData.slug || 'slug'}</span>
                </div>

                {/* Danh mục cha (Parent ID) */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Danh mục cha (Cấp trên)</label>
                  <select
                    className={styles.modalSelect}
                    value={formData.parentId ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentId: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  >
                    <option value="">— Không có (Là danh mục gốc / Cấp cao nhất) —</option>
                    {validParentOptions.map((parent) => (
                      <option key={parent.categoryId} value={parent.categoryId}>
                        {parent.iconUrl ? parent.iconUrl + ' ' : ''}
                        {parent.parentId ? ' └─ ' : ''}
                        {parent.name} (ID: {parent.categoryId})
                      </option>
                    ))}
                  </select>
                  <span className={styles.formHelp}>Chọn danh mục cấp trên hoặc để trống nếu là menu chính</span>
                </div>

                {/* Icon Emoji & Sort Order */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Icon (Emoji hoặc URL)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="📱, 💻, 🎧, ⌚..."
                      value={formData.iconUrl || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, iconUrl: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Thứ tự hiển thị</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="0, 10, 20..."
                      value={formData.sortOrder}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Ảnh đại diện (Image URL) */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ảnh đại diện (Image URL)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="https://... hoặc /images/categories/..."
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>

                {/* Mô tả */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    className={styles.formTextarea}
                    placeholder="Mô tả tóm tắt về danh mục này..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Bật / Tắt trạng thái kích hoạt */}
                <div className={styles.switchContainer}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span className={styles.slider} />
                  </label>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>
                      {formData.isActive ? 'Đang kích hoạt (Hiển thị ngoài web)' : 'Đang ẩn (Tạm khóa)'}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Cho phép khách hàng nhìn thấy danh mục này trên Navbar & Bộ lọc</div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : editingCategory ? '💾 Lưu thay đổi' : '➕ Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
