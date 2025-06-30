
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: "",
    description: "",
    category: "",
    version: "",
  });

  const documents = [
    {
      id: 1,
      title: "Employee Handbook",
      description: "Comprehensive guide covering company policies, procedures, and employee benefits",
      category: "Policy",
      version: "v2.1",
      size: "2.4 MB",
      format: "PDF",
      uploadDate: "2024-01-15",
      uploadedBy: "HR Manager",
      downloads: 142,
    },
    {
      id: 2,
      title: "Terms of Service",
      description: "Legal terms and conditions governing the use of company services",
      category: "Legal",
      version: "v1.8",
      size: "1.2 MB",
      format: "PDF",
      uploadDate: "2024-01-10",
      uploadedBy: "Legal Team",
      downloads: 89,
    },
    {
      id: 3,
      title: "Code of Conduct",
      description: "Guidelines for ethical behavior and professional standards",
      category: "Policy",
      version: "v3.0",
      size: "1.8 MB",
      format: "PDF",
      uploadDate: "2024-01-08",
      uploadedBy: "HR Manager",
      downloads: 156,
    },
    {
      id: 4,
      title: "IT Security Policy",
      description: "Information security guidelines and best practices for all employees",
      category: "Security",
      version: "v2.5",
      size: "3.1 MB",
      format: "PDF",
      uploadDate: "2024-01-05",
      uploadedBy: "IT Manager",
      downloads: 98,
    },
    {
      id: 5,
      title: "Leave Policy",
      description: "Detailed policy on various types of leave and application procedures",
      category: "Policy",
      version: "v1.6",
      size: "1.5 MB",
      format: "PDF",
      uploadDate: "2024-01-03",
      uploadedBy: "HR Manager",
      downloads: 201,
    },
    {
      id: 6,
      title: "Privacy Policy",
      description: "How we collect, use, and protect personal information",
      category: "Legal",
      version: "v2.2",
      size: "2.0 MB",
      format: "PDF",
      uploadDate: "2024-01-01",
      uploadedBy: "Legal Team",
      downloads: 76,
    },
    {
      id: 7,
      title: "Emergency Procedures",
      description: "Safety protocols and emergency response procedures",
      category: "Safety",
      version: "v1.4",
      size: "2.8 MB",
      format: "PDF",
      uploadDate: "2023-12-28",
      uploadedBy: "Safety Officer",
      downloads: 134,
    },
    {
      id: 8,
      title: "Training Manual",
      description: "Comprehensive training materials for new employees",
      category: "Training",
      version: "v4.1",
      size: "5.2 MB",
      format: "PDF",
      uploadDate: "2023-12-25",
      uploadedBy: "Training Coordinator",
      downloads: 87,
    },
  ];

  const categories = ["Policy", "Legal", "Security", "Safety", "Training"];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Policy":
        return "bg-blue-100 text-blue-800";
      case "Legal":
        return "bg-red-100 text-red-800";
      case "Security":
        return "bg-yellow-100 text-yellow-800";
      case "Safety":
        return "bg-green-100 text-green-800";
      case "Training":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document added successfully",
    });

    setNewDocument({
      title: "",
      description: "",
      category: "",
      version: "",
    });
    setIsAddingDocument(false);
  };

  const handleDownload = (documentTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${documentTitle}...`,
    });
  };

  const handlePreview = (documentTitle: string) => {
    toast({
      title: "Opening Preview",
      description: `Opening preview for ${documentTitle}...`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h2>
          <p className="text-gray-600">Access and manage company documents and policies</p>
        </div>
        <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
          <DialogTrigger asChild>
            <Button>Add New Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title *</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newDocument.category}
                  onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={newDocument.version}
                  onChange={(e) => setNewDocument({ ...newDocument, version: e.target.value })}
                  placeholder="e.g., v1.0"
                />
              </div>
              <div>
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" accept=".pdf,.doc,.docx" />
              </div>
            </div>
            <div className="flex space-x-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsAddingDocument(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDocument}>Add Document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Downloads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-sm text-gray-600">Updated This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {document.title}
                    </h3>
                    <Badge className={getCategoryColor(document.category)}>
                      {document.category}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {document.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">Version:</span> {document.version}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {document.size}
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {document.format}
                    </div>
                    <div>
                      <span className="font-medium">Downloads:</span> {document.downloads}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    Uploaded by {document.uploadedBy} on {document.uploadDate}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(document.title)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(document.title)}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No documents have been uploaded yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Documents;
