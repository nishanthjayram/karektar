export const saveDraft = async (draft: any) => {
  try {
    const response = await fetch('http://localhost:8787/api/save-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important!
      body: JSON.stringify(draft),
    })
    if (!response.ok) {
      throw new Error('Failed to save draft')
    }
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

export const getDraft = async () => {
  try {
    const response = await fetch('http://localhost:8787/api/get-draft', {
      credentials: 'include', // Important!
    })
    if (!response.ok) {
      throw new Error('Failed to fetch draft')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching draft:', error)
  }
}
