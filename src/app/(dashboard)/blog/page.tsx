'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'generate'>('search')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      {/* Management Section */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Blog Post Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveTab('search')}
            >
              Search Posts
            </Button>
            <Button
              variant={activeTab === 'generate' ? 'default' : 'outline'}
              onClick={() => setActiveTab('generate')}
            >
              Generate New Posts
            </Button>
          </div>

          {/* Search tab */}
          {activeTab === 'search' && (
            <div className="mx-auto max-w-lg space-y-4 text-center">
              <p className="text-muted-foreground">
                Review, edit, and manage the blog posts generated for your website.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Find a blog post"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Generate tab */}
          {activeTab === 'generate' && (
            <div className="mx-auto max-w-lg space-y-4 text-center">
              <p className="text-muted-foreground">
                Generate new blog posts from your titles.
              </p>
              <div className="flex justify-center gap-2">
                <Button>Generate Next</Button>
                <Button variant="secondary">Generate All</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog posts list — placeholder */}
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Blog posts will be listed here. Connect to the backend API to populate.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
