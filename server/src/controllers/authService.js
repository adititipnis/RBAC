const user = await User.findOne({ email })
  .populate('role', 'name permissions hierarchyLevel')  // Only select needed fields
  .populate('client', 'name code')  // Only select needed fields
  .select('name email password')  // Only select needed fields
  .maxTimeMS(5000) 
